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

    /// A single undoable swipe, powering the Tinder-style rewind button.
    private struct Swipe {
        let candidate: Candidate
        let createdMatchID: UUID?
    }
    private var lastSwipes: [Swipe] = []
    var canRewind: Bool { !lastSwipes.isEmpty }

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
        lastSwipes.append(Swipe(candidate: candidate, createdMatchID: nil))
        save()
    }

    /// Likes a candidate; if they already liked the member it becomes a match.
    /// A super like always creates a match (the classic "they see it first").
    func like(_ candidate: Candidate, superLike: Bool = false) {
        seenIDs.insert(candidate.id)
        deck.removeAll { $0.id == candidate.id }
        var createdMatchID: UUID?
        if candidate.likesYou || superLike {
            let match = Match(candidate: candidate,
                              messages: [Message(text: openingLine(for: candidate),
                                                 fromMe: false)])
            matches.insert(match, at: 0)
            newMatch = match
            createdMatchID = match.id
        }
        lastSwipes.append(Swipe(candidate: candidate, createdMatchID: createdMatchID))
        save()
    }

    /// Undoes the most recent swipe: returns the candidate to the top of the
    /// deck and removes any match it created.
    func rewind() {
        guard let swipe = lastSwipes.popLast() else { return }
        seenIDs.remove(swipe.candidate.id)
        if let matchID = swipe.createdMatchID {
            matches.removeAll { $0.id == matchID }
            if newMatch?.id == matchID { newMatch = nil }
        }
        deck.insert(swipe.candidate, at: 0)
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
        lastSwipes = []
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
            "Hej! Fedt at matche med en anden frontliner 😊",
            "Hej! Din profil fik mig til at smile — hvordan går din uge?",
            "Hej! Lang vagt eller fridag i dag?",
            "Hej! Vi matchede — hvordan slapper du bedst af efter arbejde?",
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
