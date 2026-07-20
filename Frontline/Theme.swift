import SwiftUI

/// Central place for the app's colours and reusable gradients.
enum Theme {
    static let brand = Color(red: 0.91, green: 0.24, blue: 0.40)
    static let brandDeep = Color(red: 0.62, green: 0.13, blue: 0.42)

    /// The signature warm gradient used on the logo and primary buttons.
    static var brandGradient: LinearGradient {
        LinearGradient(
            colors: [brand, brandDeep],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

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
