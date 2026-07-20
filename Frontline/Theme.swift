import SwiftUI

/// Central place for the app's colours and reusable gradients.
///
/// The palette is a deliberately distinct "trust / verified" blue→teal — it is
/// NOT Tinder's orange→pink brand gradient, and the app avoids Tinder's flame
/// mark and trademarked feature names (see LEGAL.md).
enum Theme {
    /// Brand gradient endpoints (blue → teal).
    static let brandA = Color(red: 0.16, green: 0.36, blue: 0.90) // #2A5CE6
    static let brandB = Color(red: 0.05, green: 0.68, blue: 0.62) // #0DAE9E
    static let brand = Color(red: 0.16, green: 0.40, blue: 0.86)
    static let brandDeep = Color(red: 0.10, green: 0.24, blue: 0.66)

    /// The signature gradient used on the logo and primary buttons.
    static var brandGradient: LinearGradient {
        LinearGradient(
            colors: [brandA, brandB],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // Action-button colours. Like/nope are generic; the "highlight" (our name
    // for a priority like — not Tinder's "Super Like") uses a distinct violet.
    static let nope = Color(red: 0.98, green: 0.30, blue: 0.42)
    static let like = Color(red: 0.10, green: 0.78, blue: 0.55)
    static let superLike = Color(red: 0.52, green: 0.36, blue: 0.94)
    static let rewind = Color(red: 0.55, green: 0.58, blue: 0.65)

    /// Deterministic gradient used to stand in for a candidate's photo.
    static func cardGradient(seed: Int) -> LinearGradient {
        let palette: [[Color]] = [
            [Color(red: 0.98, green: 0.45, blue: 0.55), Color(red: 0.60, green: 0.20, blue: 0.55)],
            [Color(red: 0.30, green: 0.55, blue: 0.95), Color(red: 0.15, green: 0.25, blue: 0.60)],
            [Color(red: 0.98, green: 0.62, blue: 0.30), Color(red: 0.85, green: 0.25, blue: 0.35)],
            [Color(red: 0.20, green: 0.70, blue: 0.65), Color(red: 0.10, green: 0.35, blue: 0.45)],
            [Color(red: 0.60, green: 0.45, blue: 0.85), Color(red: 0.30, green: 0.20, blue: 0.55)],
            [Color(red: 0.95, green: 0.50, blue: 0.65), Color(red: 0.55, green: 0.15, blue: 0.45)],
        ]
        let pair = palette[abs(seed) % palette.count]
        return LinearGradient(colors: pair, startPoint: .top, endPoint: .bottom)
    }
}
