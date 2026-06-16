import SwiftUI

/// A spinnable wheel rendered with `Canvas`. The whole canvas rotates so the
/// segment under the top pointer is the selected result.
struct WheelView: View {
    let tasks: [WheelTask]
    let rotation: Double

    var body: some View {
        GeometryReader { proxy in
            let size = min(proxy.size.width, proxy.size.height)
            ZStack {
                Canvas { context, canvasSize in
                    draw(in: &context, size: canvasSize)
                }
                .frame(width: size, height: size)
                .rotationEffect(.degrees(rotation))

                // Hub
                Circle()
                    .fill(Color(.systemBackground))
                    .frame(width: size * 0.16, height: size * 0.16)
                    .overlay(Circle().stroke(Color.primary.opacity(0.15), lineWidth: 2))
                    .shadow(radius: 2)
            }
            .frame(width: proxy.size.width, height: proxy.size.height)
        }
    }

    private func draw(in context: inout GraphicsContext, size: CGSize) {
        let count = tasks.count
        guard count > 0 else { return }

        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let radius = min(size.width, size.height) / 2
        let segAngle = 360.0 / Double(count)

        for index in 0..<count {
            // Screen angle: 0° = east, increasing clockwise. Top (pointer) = -90°.
            let start = Angle.degrees(Double(index) * segAngle - 90)
            let end = Angle.degrees(Double(index + 1) * segAngle - 90)

            var wedge = Path()
            wedge.move(to: center)
            wedge.addArc(center: center,
                         radius: radius,
                         startAngle: start,
                         endAngle: end,
                         clockwise: false)
            wedge.closeSubpath()

            context.fill(wedge, with: .color(WheelPalette.color(at: index)))
            context.stroke(wedge, with: .color(.white.opacity(0.5)), lineWidth: 1)

            drawLabel(tasks[index].text,
                      index: index,
                      segAngle: segAngle,
                      center: center,
                      radius: radius,
                      in: &context)
        }

        // Outer ring
        let ring = Path(ellipseIn: CGRect(x: center.x - radius,
                                          y: center.y - radius,
                                          width: radius * 2,
                                          height: radius * 2))
        context.stroke(ring, with: .color(.primary.opacity(0.12)), lineWidth: 4)
    }

    private func drawLabel(_ text: String,
                           index: Int,
                           segAngle: Double,
                           center: CGPoint,
                           radius: CGFloat,
                           in context: inout GraphicsContext) {
        // Centre of the segment, measured clockwise from the top pointer.
        let midFromTop = Double(index) * segAngle + segAngle / 2
        let rad = midFromTop * .pi / 180
        let labelRadius = radius * 0.6
        let point = CGPoint(x: center.x + sin(rad) * labelRadius,
                            y: center.y - cos(rad) * labelRadius)

        let resolved = context.resolve(
            Text(text)
                .font(.system(size: max(9, min(15, radius * 0.09)), weight: .semibold))
                .foregroundColor(.white)
        )

        var labelContext = context
        labelContext.translateBy(x: point.x, y: point.y)
        // Rotate so text runs along the radius and stays upright-ish.
        labelContext.rotate(by: .degrees(midFromTop))
        labelContext.draw(resolved, at: .zero, anchor: .center)
    }
}

/// Triangular pointer that sits at the top of the wheel.
struct WheelPointer: View {
    var body: some View {
        Triangle()
            .fill(Color.primary)
            .frame(width: 26, height: 22)
            .shadow(radius: 2)
            .accessibilityHidden(true)
    }
}

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        path.closeSubpath()
        return path
    }
}
