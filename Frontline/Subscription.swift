import SwiftUI

/// Subscription tiers, modelled on Tinder's Free / Plus / Gold ladder.
///
/// NOTE: purchases here are simulated locally so the app is fully usable
/// without a backend. To ship for real, back each `Tier` with a StoreKit 2
/// `Product` (an auto-renewable subscription configured in App Store Connect)
/// and drive `AppState.subscribe(_:)` from a verified `Transaction`.
enum Tier: String, Codable, CaseIterable, Identifiable {
    case free
    case plus
    case gold

    var id: String { rawValue }

    var label: String {
        switch self {
        case .free: return "Gratis"
        case .plus: return "Frontline Plus"
        case .gold: return "Frontline Gold"
        }
    }

    var shortLabel: String {
        switch self {
        case .free: return "Gratis"
        case .plus: return "Plus"
        case .gold: return "Gold"
        }
    }

    /// Mock monthly price shown on the paywall.
    var priceLabel: String {
        switch self {
        case .free: return "0 kr."
        case .plus: return "79 kr./md."
        case .gold: return "149 kr./md."
        }
    }

    var tagline: String {
        switch self {
        case .free: return "Kom i gang og find dine første matches."
        case .plus: return "Ubegrænsede likes, fortryd og flere superlikes."
        case .gold: return "Se hvem der kan lide dig — og alt i Plus."
        }
    }

    /// The headline perks listed on the paywall card.
    var perks: [String] {
        switch self {
        case .free:
            return ["Begrænset antal likes om dagen", "1 superlike om dagen"]
        case .plus:
            return ["Ubegrænsede likes", "Fortryd sidste swipe",
                    "5 superlikes om dagen", "Ingen begrænsning på afstand"]
        case .gold:
            return ["Se hvem der kan lide dig", "1 boost om måneden",
                    "Alt i Plus"]
        }
    }

    var accent: Color {
        switch self {
        case .free: return .secondary
        case .plus: return Theme.superLike
        case .gold: return Color(red: 0.95, green: 0.72, blue: 0.20)
        }
    }
}

/// What a given tier unlocks. Feature gates read from here, never from `Tier`
/// directly, so the ladder is easy to re-tune in one place.
struct Entitlements {
    let dailyLikeLimit: Int      // Int.max == unlimited
    let superLikesPerDay: Int
    let canRewind: Bool
    let canSeeLikesYou: Bool
    let boostsPerMonth: Int

    static func of(_ tier: Tier) -> Entitlements {
        switch tier {
        case .free:
            return Entitlements(dailyLikeLimit: 15, superLikesPerDay: 1,
                                canRewind: false, canSeeLikesYou: false,
                                boostsPerMonth: 0)
        case .plus:
            return Entitlements(dailyLikeLimit: .max, superLikesPerDay: 5,
                                canRewind: true, canSeeLikesYou: false,
                                boostsPerMonth: 0)
        case .gold:
            return Entitlements(dailyLikeLimit: .max, superLikesPerDay: 5,
                                canRewind: true, canSeeLikesYou: true,
                                boostsPerMonth: 1)
        }
    }
}

/// Reason the paywall was raised, so it can open on the most relevant pitch.
enum PaywallReason: Identifiable {
    case outOfLikes
    case outOfSuperLikes
    case rewind
    case seeLikesYou
    case boost
    case general

    var id: Int {
        switch self {
        case .outOfLikes: return 0
        case .outOfSuperLikes: return 1
        case .rewind: return 2
        case .seeLikesYou: return 3
        case .boost: return 4
        case .general: return 5
        }
    }

    var headline: String {
        switch self {
        case .outOfLikes: return "Du er løbet tør for likes"
        case .outOfSuperLikes: return "Ikke flere superlikes i dag"
        case .rewind: return "Fortryd dit sidste swipe"
        case .seeLikesYou: return "Se hvem der kan lide dig"
        case .boost: return "Kom øverst med et boost"
        case .general: return "Få mere ud af Frontline"
        }
    }
}
