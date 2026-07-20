import SwiftUI

// MARK: - Pressable button

/// Gives any button a springy press-down scale — used on the action buttons.
struct PressableButtonStyle: ButtonStyle {
    var scale: CGFloat = 0.88
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scale : 1)
            .animation(.spring(response: 0.28, dampingFraction: 0.55),
                       value: configuration.isPressed)
    }
}

// MARK: - Typing indicator

/// Three bouncing dots shown while a match is "typing".
struct TypingDots: View {
    var tint: Color = .secondary
    @State private var up = false

    var body: some View {
        HStack(spacing: 5) {
            ForEach(0..<3, id: \.self) { i in
                Circle()
                    .fill(tint)
                    .frame(width: 7, height: 7)
                    .offset(y: up ? -3 : 3)
                    .animation(.easeInOut(duration: 0.5).repeatForever()
                        .delay(Double(i) * 0.15), value: up)
            }
        }
        .onAppear { up = true }
    }
}

// MARK: - Confetti

/// A lightweight, self-contained confetti burst drawn with `Canvas`. Runs for
/// `duration` seconds and then fades — no external assets.
struct ConfettiView: View {
    var colors: [Color] = [
        Theme.brandA, Theme.brandB, Theme.like, Theme.superLike,
        Color(red: 1.0, green: 0.78, blue: 0.25)
    ]
    var count = 90
    var duration: Double = 2.4

    private struct Piece {
        let x: CGFloat          // 0…1 horizontal start
        let delay: Double
        let sway: CGFloat
        let spin: Double
        let size: CGFloat
        let colorIndex: Int
        let fallSpeed: CGFloat
    }

    private let pieces: [Piece]
    private let startDate = Date()

    init(colors: [Color]? = nil, count: Int = 90, duration: Double = 2.4) {
        if let colors { self.colors = colors }
        self.count = count
        self.duration = duration
        var rng = SystemRandomNumberGenerator()
        pieces = (0..<count).map { i in
            Piece(
                x: CGFloat.random(in: 0.05...0.95, using: &rng),
                delay: Double.random(in: 0...0.5, using: &rng),
                sway: CGFloat.random(in: 20...70, using: &rng),
                spin: Double.random(in: 2...6, using: &rng),
                size: CGFloat.random(in: 6...11, using: &rng),
                colorIndex: i % (colors?.count ?? 5),
                fallSpeed: CGFloat.random(in: 0.85...1.3, using: &rng)
            )
        }
    }

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                let elapsed = timeline.date.timeIntervalSince(startDate)
                for piece in pieces {
                    let t = elapsed - piece.delay
                    guard t >= 0 else { continue }
                    let progress = min(t / duration, 1)
                    let y = CGFloat(progress) * size.height * piece.fallSpeed - piece.size
                    let x = piece.x * size.width
                        + sin(CGFloat(t) * 3 + piece.x * 10) * piece.sway
                    let opacity = 1 - progress
                    guard opacity > 0 else { continue }

                    var rect = context
                    rect.translateBy(x: x, y: y)
                    rect.rotate(by: .radians(t * piece.spin))
                    rect.opacity = opacity
                    let r = CGRect(x: -piece.size / 2, y: -piece.size / 2,
                                   width: piece.size, height: piece.size * 0.6)
                    rect.fill(Path(roundedRect: r, cornerRadius: 1.5),
                              with: .color(colors[piece.colorIndex]))
                }
            }
        }
        .allowsHitTesting(false)
    }
}
