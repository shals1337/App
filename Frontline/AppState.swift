import SwiftUI

/// Single source of truth for the app: the signed-in member, the discover
/// deck, likes/passes, and matches. Everything is persisted locally with
/// `UserDefaults` (JSON) so there is no backend to run.
final class AppState: ObservableObject {
    @Published var user: UserProfile?
    @Published private(set) var deck: [Candidate] = []
    @Published private(set) var matches: [Match] = []

    /// The most recent match, surfaced so the UI can show a "It's a match!"
    /// celebration once and then clear it.
    @Published var newMatch: Match?

    private let defaults = UserDefaults.standard
    private enum Keys {
        static let user = "frontline.user"
        static let matches = "frontline.matches"
        static let seenIDs = "frontline.seenIDs"
    }

    /// Candidate ids the member has already swiped, so they never reappear.
    private var seenIDs: Set<UUID> = []

    init() {
        load()
    }

    var isOnboarded: Bool { user?.isVerified == true }

    // MARK: - Onboarding

    func completeOnboarding(_ profile: UserProfile) {
        var verified = profile
        verified.isVerified = true
        user = verified
        rebuildDeck()
        save()
    }

    func updateProfile(_ profile: UserProfile) {
        user = profile
        rebuildDeck()
        save()
    }

    // MARK: - Discover

    /// The candidate currently on top of the deck.
    var topCandidate: Candidate? { deck.first }

    func pass(_ candidate: Candidate) {
        seenIDs.insert(candidate.id)
        deck.removeAll { $0.id == candidate.id }
        save()
    }

    /// Likes a candidate; if they already liked the member it becomes a match.
    func like(_ candidate: Candidate) {
        seenIDs.insert(candidate.id)
        deck.removeAll { $0.id == candidate.id }
        if candidate.likesYou {
            let match = Match(candidate: candidate,
                              messages: [Message(text: openingLine(for: candidate),
                                                 fromMe: false)])
            matches.insert(match, at: 0)
            newMatch = match
        }
        save()
    }

    // MARK: - Chat

    func send(_ text: String, to matchID: UUID) {
        guard let index = matches.firstIndex(where: { $0.id == matchID }) else { return }
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        matches[index].messages.append(Message(text: trimmed, fromMe: true))
        save()
    }

    // MARK: - Reset

    /// Wipes the profile and all local data — used from Settings.
    func signOutAndErase() {
        user = nil
        deck = []
        matches = []
        seenIDs = []
        newMatch = nil
        defaults.removeObject(forKey: Keys.user)
        defaults.removeObject(forKey: Keys.matches)
        defaults.removeObject(forKey: Keys.seenIDs)
    }

    // MARK: - Deck building

    /// Rebuilds the deck from sample data, applying the member's filters:
    /// only unseen candidates, whose gender the member is seeking, and who are
    /// not already a match.
    private func rebuildDeck() {
        guard let user else { deck = []; return }
        let matchedIDs = Set(matches.map(\.id))
        deck = SampleData.candidates.filter { candidate in
            !seenIDs.contains(candidate.id)
            && !matchedIDs.contains(candidate.id)
            && user.seeking.contains(candidate.gender)
        }
    }

    private func openingLine(for candidate: Candidate) -> String {
        let lines = [
            "Hey! Great to match with a fellow frontliner 😊",
            "Hi! Your bio made me smile — how's your week going?",
            "Hey there! Long shift or day off today?",
            "Hi! We matched — what's your go-to way to unwind after work?",
        ]
        return lines[abs(candidate.gradientSeed) % lines.count]
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
        let ids = seenIDs.map(\.uuidString)
        defaults.set(ids, forKey: Keys.seenIDs)
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
        rebuildDeck()
    }
}
