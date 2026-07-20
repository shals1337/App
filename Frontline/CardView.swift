import SwiftUI

/// A single swipeable profile card.
struct CardView: View {
    let candidate: Candidate
    /// Horizontal drag offset, used to reveal the LIKE / NOPE stamps.
    var dragWidth: CGFloat = 0

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            Theme.cardGradient(seed: candidate.gradientSeed)

            // A soft silhouette stands in for a photo.
            Image(systemName: "person.fill")
                .font(.system(size: 180))
                .foregroundStyle(.white.opacity(0.18))
                .offset(y: -30)

            // Readability scrim behind the text.
            LinearGradient(colors: [.clear, .black.opacity(0.65)],
                           startPoint: .center, endPoint: .bottom)

            info

            stamps
        }
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .strokeBorder(.white.opacity(0.12), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.18), radius: 16, y: 8)
    }

    private var info: some View {
        VStack(alignment: .leading, spacing: 10) {
            ProfessionBadge(profession: candidate.profession)

            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(candidate.name)
                    .font(.system(size: 32, weight: .bold))
                Text("\(candidate.age)")
                    .font(.system(size: 28, weight: .light))
            }
            .foregroundStyle(.white)

            Label("\(candidate.city) · \(candidate.distanceKm) km away",
                  systemImage: "mappin.circle.fill")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.9))

            Text(candidate.bio)
                .font(.callout)
                .foregroundStyle(.white.opacity(0.92))
                .lineLimit(3)
        }
        .padding(20)
    }

    private var stamps: some View {
        ZStack {
            Stamp(text: "LIKE", color: .green, rotation: -18)
                .opacity(Double(max(0, dragWidth) / 90))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(28)

            Stamp(text: "NOPE", color: .red, rotation: 18)
                .opacity(Double(max(0, -dragWidth) / 90))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .padding(28)
        }
    }
}

/// The coloured profession pill used on cards and profiles.
struct ProfessionBadge: View {
    let profession: Profession

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: profession.symbol)
            Text(profession.label)
            Image(systemName: "checkmark.seal.fill")
                .font(.caption2)
        }
        .font(.caption.weight(.semibold))
        .foregroundStyle(.white)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(profession.tint, in: Capsule())
    }
}

private struct Stamp: View {
    let text: String
    let color: Color
    let rotation: Double

    var body: some View {
        Text(text)
            .font(.system(size: 34, weight: .heavy))
            .foregroundStyle(color)
            .padding(.horizontal, 12)
            .padding(.vertical, 4)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .strokeBorder(color, lineWidth: 4)
            )
            .rotationEffect(.degrees(rotation))
    }
}
