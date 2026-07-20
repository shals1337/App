import SwiftUI

/// Single source of truth for the app: the signed-in member, the discover
/// deck, likes/passes, matches, subscription tier and daily quotas.
/// Everything is persisted locally with `UserDefaults` (JSON) so the app is
/// fully usable with no backend.
final class AppState: ObservableObject {
    @Published var user: UserProfile?
    @Published private(set) var deck: [Candidate] = []
    @Published private(set) var matches: [Match] = []

    /// The most recent match, surfaced so the UI can show a celebration once.
    @Published var newMatch: Match?

    // Subscription & daily quotas.
    @Published private(set) var tier: Tier = .free
    @Published private(set) var likesUsedToday = 0
    @Published private(set) var superLikesUsedToday = 0
    @Published private(set) var boostActiveUntil: Date?

    // GDPR consent.
    @Published private(set) var consent = PrivacyConsent()

    /// The match whose partner is currently "typing" (drives the chat indicator).
    @Published var typingMatchID: UUID?

    private let defaults = UserDefaults.standard
    private enum Keys {
        static let user = "frontline.user"
        static let matches = "frontline.matches"
        static let seenIDs = "frontline.seenIDs"
        static let tier = "frontline.tier"
        static let likesUsed = "frontline.likesUsed"
        static let superUsed = "frontline.superUsed"
        static let quotaDay = "frontline.quotaDay"
        static let boostUntil = "frontline.boostUntil"
        static let consent = "frontline.consent"
    }

    /// Candidate ids the member has already swiped, so they never reappear.
    private var seenIDs: Set<UUID> = []

    /// A single undoable swipe, powering the Tinder-style rewind button.
    private struct Swipe {
        let candidate: Candidate
        let createdMatchID: UUID?
        let consumedLike: Bool
        let consumedSuper: Bool
    }
    private var lastSwipes: [Swipe] = []

    /// Start-of-day the current quota counts belong to.
    private var quotaDay = Calendar.current.startOfDay(for: Date())

    init() {
        load()
    }

    var isOnboarded: Bool { user != nil }

    /// Whether the member has given every consent required to use the app.
    var hasRequiredConsent: Bool {
        consent.over18
        && consent.acceptedPolicyVersion == LegalDocs.policyVersion
        && consent.acceptedTermsVersion == LegalDocs.termsVersion
        && consent.specialCategory
    }

    // MARK: - Consent (GDPR)

    func recordConsent(over18: Bool, specialCategory: Bool) {
        consent.over18 = over18
        consent.specialCategory = specialCategory
        consent.acceptedPolicyVersion = LegalDocs.policyVersion
        consent.acceptedTermsVersion = LegalDocs.termsVersion
        consent.updatedAt = Date()
        save()
    }

    /// Explicit consent to process the verification selfie (biometric data).
    func grantBiometricConsent() {
        consent.biometric = true
        save()
    }

    /// Withdraws special-category consent; also stops showing those profiles.
    func withdrawSpecialConsent() {
        consent.specialCategory = false
        consent.updatedAt = Date()
        rebuildDeck()
        save()
    }

    /// Right to data portability: writes a JSON export to a temp file and
    /// returns its URL for a share sheet.
    func exportData() -> URL? {
        struct Export: Encodable {
            let exportedAt: Date
            let profile: UserProfile?
            let subscriptionTier: String
            let matches: [Match]
            let consent: PrivacyConsent
        }
        let payload = Export(exportedAt: Date(), profile: user,
                             subscriptionTier: tier.rawValue,
                             matches: matches, consent: consent)
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        guard let data = try? encoder.encode(payload) else { return nil }
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("frontline-mine-data.json")
        do { try data.write(to: url); return url } catch { return nil }
    }

    // MARK: - Entitlements & quotas

    var entitlements: Entitlements { .of(tier) }

    /// Remaining likes today, or `nil` when unlimited.
    var likesRemaining: Int? {
        let limit = entitlements.dailyLikeLimit
        return limit == .max ? nil : max(0, limit - likesUsedToday)
    }
    var superLikesRemaining: Int {
        max(0, entitlements.superLikesPerDay - superLikesUsedToday)
    }
    var canLike: Bool { likesRemaining == nil || likesRemaining! > 0 }
    var canSuperLike: Bool { superLikesRemaining > 0 }
    var canRewind: Bool { entitlements.canRewind && !lastSwipes.isEmpty }
    var hasRewindEntitlement: Bool { entitlements.canRewind }
    var isBoosted: Bool { (boostActiveUntil ?? .distantPast) > Date() }

    // MARK: - Onboarding

    func completeOnboarding(_ profile: UserProfile) {
        var verified = profile
        verified.isVerified = true          // profession confirmed in onboarding
        user = verified
        rebuildDeck()
        save()
    }

    func updateProfile(_ profile: UserProfile) {
        user = profile
        rebuildDeck()
        save()
    }

    // MARK: - Verification

    /// Completes the (simulated) selfie / photo check.
    func verifyPhoto() {
        user?.photoVerified = true
        save()
    }

    /// Re-confirms the (simulated) profession / work-ID check.
    func verifyProfession() {
        user?.isVerified = true
        save()
    }

    // MARK: - Subscription

    func subscribe(to newTier: Tier) {
        tier = newTier
        save()
    }

    /// Activates a boost (a Gold perk) for 30 minutes.
    func activateBoost() {
        guard entitlements.boostsPerMonth > 0 else { return }
        boostActiveUntil = Date().addingTimeInterval(30 * 60)
        save()
    }

    // MARK: - Discover

    var topCandidate: Candidate? { deck.first }

    func pass(_ candidate: Candidate) {
        seenIDs.insert(candidate.id)
        deck.removeAll { $0.id == candidate.id }
        lastSwipes.append(Swipe(candidate: candidate, createdMatchID: nil,
                                consumedLike: false, consumedSuper: false))
        save()
    }

    /// Likes a candidate; if they already liked the member (or it's a super
    /// like) it becomes a match. Assumes the caller has checked the quota.
    func like(_ candidate: Candidate, superLike: Bool = false) {
        refreshQuotaIfNeeded()
        seenIDs.insert(candidate.id)
        deck.removeAll { $0.id == candidate.id }

        if superLike { superLikesUsedToday += 1 } else { likesUsedToday += 1 }

        var createdMatchID: UUID?
        if candidate.likesYou || superLike {
            let match = Match(candidate: candidate,
                              messages: [Message(text: openingLine(for: candidate),
                                                 fromMe: false)])
            matches.insert(match, at: 0)
            newMatch = match
            createdMatchID = match.id
        }
        lastSwipes.append(Swipe(candidate: candidate, createdMatchID: createdMatchID,
                                consumedLike: !superLike, consumedSuper: superLike))
        save()
    }

    /// Undoes the most recent swipe: returns the candidate to the top of the
    /// deck, removes any match it created, and refunds a consumed like.
    func rewind() {
        guard entitlements.canRewind, let swipe = lastSwipes.popLast() else { return }
        seenIDs.remove(swipe.candidate.id)
        if let matchID = swipe.createdMatchID {
            matches.removeAll { $0.id == matchID }
            if newMatch?.id == matchID { newMatch = nil }
        }
        if swipe.consumedLike { likesUsedToday = max(0, likesUsedToday - 1) }
        if swipe.consumedSuper { superLikesUsedToday = max(0, superLikesUsedToday - 1) }
        deck.insert(swipe.candidate, at: 0)
        save()
    }

    // MARK: - Likes You (Gold)

    /// Members who have already liked the current member and aren't matched yet.
    var likesYouCandidates: [Candidate] {
        let matchedIDs = Set(matches.map(\.id))
        return SampleData.candidates.filter { candidate in
            candidate.likesYou
            && !matchedIDs.contains(candidate.id)
            && !seenIDs.contains(candidate.id)
            && passesPreferences(candidate)
        }
    }

    // MARK: - Chat

    func send(_ text: String, to matchID: UUID) {
        guard let index = matches.firstIndex(where: { $0.id == matchID }) else { return }
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let message = Message(text: trimmed, fromMe: true)
        matches[index].messages.append(message)
        save()
        simulateConversation(matchID: matchID, myMessageID: message.id)
    }

    /// Simulates the other side reading your message and replying, so read
    /// receipts and the typing indicator feel alive without a backend.
    private func simulateConversation(matchID: UUID, myMessageID: UUID) {
        // 1. Mark the message "seen" after a beat.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.1) { [weak self] in
            guard let self,
                  let m = self.matches.firstIndex(where: { $0.id == matchID }),
                  let i = self.matches[m].messages.firstIndex(where: { $0.id == myMessageID })
            else { return }
            withAnimation(.easeInOut) { self.matches[m].messages[i].seen = true }
            self.save()

            // 2. Show the typing indicator.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                withAnimation { self.typingMatchID = matchID }

                // 3. Land a reply and clear typing.
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                    guard let mm = self.matches.firstIndex(where: { $0.id == matchID }) else {
                        self.typingMatchID = nil; return
                    }
                    withAnimation(.spring) {
                        self.typingMatchID = nil
                        self.matches[mm].messages.append(
                            Message(text: self.reply(for: self.matches[mm]), fromMe: false)
                        )
                    }
                    self.save()
                }
            }
        }
    }

    private func reply(for match: Match) -> String {
        let replies = [
            "Haha, det lyder som en plan 😄",
            "Enig! Hvornår passer det dig bedst?",
            "Godt at høre 😊 Jeg har fri i weekenden.",
            "Ja tak! Kender du et godt sted?",
            "Det kunne jeg godt tænke mig ☕️",
        ]
        // Vary by how far the conversation has come.
        return replies[match.messages.count % replies.count]
    }

    // MARK: - Reset

    func signOutAndErase() {
        user = nil
        deck = []
        matches = []
        seenIDs = []
        lastSwipes = []
        newMatch = nil
        tier = .free
        likesUsedToday = 0
        superLikesUsedToday = 0
        boostActiveUntil = nil
        typingMatchID = nil
        consent = PrivacyConsent()
        [Keys.user, Keys.matches, Keys.seenIDs, Keys.tier,
         Keys.likesUsed, Keys.superUsed, Keys.quotaDay, Keys.boostUntil, Keys.consent]
            .forEach { defaults.removeObject(forKey: $0) }
    }

    // MARK: - Deck building

    /// Whether a candidate matches the member's discovery preferences.
    private func passesPreferences(_ candidate: Candidate) -> Bool {
        guard let user else { return false }
        return user.seeking.contains(candidate.gender)
            && candidate.age >= user.minAge
            && candidate.age <= user.maxAge
            && candidate.distanceKm <= user.maxDistanceKm
    }

    private func rebuildDeck() {
        guard user != nil else { deck = []; return }
        let matchedIDs = Set(matches.map(\.id))
        deck = SampleData.candidates.filter { candidate in
            !seenIDs.contains(candidate.id)
            && !matchedIDs.contains(candidate.id)
            && passesPreferences(candidate)
        }
    }

    private func openingLine(for candidate: Candidate) -> String {
        let lines = [
            "Hej! Fedt at matche med en anden frontliner 😊",
            "Hej! Din profil fik mig til at smile — hvordan går din uge?",
            "Hej! Lang vagt eller fridag i dag?",
            "Hej! Vi matchede — hvordan slapper du bedst af efter arbejde?",
        ]
        return lines[abs(candidate.gradientSeed) % lines.count]
    }

    /// Resets the daily counters when the calendar day rolls over.
    private func refreshQuotaIfNeeded() {
        let today = Calendar.current.startOfDay(for: Date())
        if today != quotaDay {
            quotaDay = today
            likesUsedToday = 0
            superLikesUsedToday = 0
            save()
        }
    }

    // MARK: - Persistence

    private func save() {
        let encoder = JSONEncoder()
        if let user, let data = try? encoder.encode(user) {
            defaults.set(data, forKey: Keys.user)
        }
        if let data = try? encoder.encode(matches) {
            defaults.set(data, forKey: Keys.matches)
        }
        defaults.set(seenIDs.map(\.uuidString), forKey: Keys.seenIDs)
        defaults.set(tier.rawValue, forKey: Keys.tier)
        defaults.set(likesUsedToday, forKey: Keys.likesUsed)
        defaults.set(superLikesUsedToday, forKey: Keys.superUsed)
        defaults.set(quotaDay.timeIntervalSince1970, forKey: Keys.quotaDay)
        defaults.set(boostActiveUntil?.timeIntervalSince1970 ?? 0, forKey: Keys.boostUntil)
        if let data = try? encoder.encode(consent) {
            defaults.set(data, forKey: Keys.consent)
        }
    }

    private func load() {
        let decoder = JSONDecoder()
        if let data = defaults.data(forKey: Keys.user),
           let decoded = try? decoder.decode(UserProfile.self, from: data) {
            user = decoded
        }
        if let data = defaults.data(forKey: Keys.matches),
           let decoded = try? decoder.decode([Match].self, from: data) {
            matches = decoded
        }
        if let ids = defaults.stringArray(forKey: Keys.seenIDs) {
            seenIDs = Set(ids.compactMap(UUID.init))
        }
        if let raw = defaults.string(forKey: Keys.tier), let t = Tier(rawValue: raw) {
            tier = t
        }
        likesUsedToday = defaults.integer(forKey: Keys.likesUsed)
        superLikesUsedToday = defaults.integer(forKey: Keys.superUsed)
        if let day = defaults.object(forKey: Keys.quotaDay) as? Double {
            quotaDay = Date(timeIntervalSince1970: day)
        }
        let boost = defaults.double(forKey: Keys.boostUntil)
        boostActiveUntil = boost > 0 ? Date(timeIntervalSince1970: boost) : nil
        if let data = defaults.data(forKey: Keys.consent),
           let decoded = try? decoder.decode(PrivacyConsent.self, from: data) {
            consent = decoded
        }

        refreshQuotaIfNeeded()
        rebuildDeck()
    }
}
