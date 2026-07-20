import SwiftUI

/// Central place for the app's colours and reusable gradients.
enum Theme {
    /// Tinder-style warm gradient endpoints (orange → pink/red).
    static let flameStart = Color(red: 1.00, green: 0.47, blue: 0.33) // #FF7854
    static let flameEnd = Color(red: 0.99, green: 0.15, blue: 0.48) // #FD267A
    static let brand = flameEnd
    static let brandDeep = Color(red: 0.85, green: 0.10, blue: 0.42)

    /// The signature warm gradient used on the logo and primary buttons.
    static var brandGradient: LinearGradient {
        LinearGradient(
            colors: [flameStart, flameEnd],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // Action colours matching the Tinder button row.
    static let nope = Color(red: 0.98, green: 0.30, blue: 0.42)
    static let like = Color(red: 0.10, green: 0.85, blue: 0.62)
    static let superLike = Color(red: 0.25, green: 0.70, blue: 1.00)
    static let rewind = Color(red: 1.00, green: 0.78, blue: 0.20)

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
