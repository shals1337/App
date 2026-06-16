import SwiftUI

/// A single entry shown on the wheel.
struct WheelTask: Identifiable, Codable, Equatable, Hashable {
    var id: UUID
    var text: String

    init(id: UUID = UUID(), text: String) {
        self.id = id
        self.text = text
    }
}

extension WheelTask {
    /// Neutral starter content. Replace these with your own from the Tasks screen.
    static let samples: [WheelTask] = [
        WheelTask(text: "Drink a glass of water"),
        WheelTask(text: "Stretch for 5 minutes"),
        WheelTask(text: "Tidy one surface"),
        WheelTask(text: "Send a kind message"),
        WheelTask(text: "Step outside for fresh air"),
        WheelTask(text: "Write one thing you're grateful for"),
        WheelTask(text: "Do 10 squats"),
        WheelTask(text: "Take 5 deep breaths")
    ]
}

/// A fixed palette used to colour the wheel segments.
enum WheelPalette {
    static let colors: [Color] = [
        Color(red: 0.96, green: 0.30, blue: 0.47),
        Color(red: 0.99, green: 0.55, blue: 0.30),
        Color(red: 0.99, green: 0.78, blue: 0.27),
        Color(red: 0.42, green: 0.78, blue: 0.45),
        Color(red: 0.30, green: 0.69, blue: 0.86),
        Color(red: 0.40, green: 0.47, blue: 0.86),
        Color(red: 0.61, green: 0.42, blue: 0.86),
        Color(red: 0.91, green: 0.45, blue: 0.78)
    ]

    static func color(at index: Int) -> Color {
        colors[index % colors.count]
    }
}
