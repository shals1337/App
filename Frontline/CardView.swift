import SwiftUI

/// A single swipeable profile card.
struct CardView: View {
    let candidate: Candidate
    /// Drag offset, used to reveal the LIKE / NOPE / SUPER LIKE stamps.
    var drag: CGSize = .zero

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            Theme.cardGradient(seed: candidate.gradientSeed)

            // A large translucent monogram stands in for a photo.
            Text(monogram)
                .font(.system(size: 150, weight: .black, design: .rounded))
                .foregroundStyle(.white.opacity(0.20))
                .offset(y: -24)

            // Readability scrim behind the text.
            LinearGradient(colors: [.clear, .black.opacity(0.68)],
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

    private var monogram: String {
        String(candidate.name.prefix(1)).uppercased()
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

            Label("\(candidate.city) · \(candidate.distanceKm) km væk",
                  systemImage: "mappin.circle.fill")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.9))

            Text(candidate.bio)
                .font(.callout)
                .foregroundStyle(.white.opacity(0.92))
                .lineLimit(2)

            HStack(spacing: 6) {
                LookingForTag(lookingFor: candidate.lookingFor)
                ForEach(candidate.interests.prefix(2), id: \.self) { interest in
                    InterestChip(text: interest)
                }
            }
        }
        .padding(20)
    }

    private var stamps: some View {
        ZStack {
            Stamp(text: "LIKE", color: Theme.like, rotation: -18)
                .opacity(Double(max(0, drag.width) / 90))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(28)

            Stamp(text: "NEJ", color: Theme.nope, rotation: 18)
                .opacity(Double(max(0, -drag.width) / 90))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .padding(28)

            Stamp(text: "FREMHÆV", color: Theme.superLike, rotation: -8)
                .opacity(Double(max(0, -drag.height) / 90))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
                .padding(.bottom, 120)
        }
    }
}

/// A small interest tag. `onDark` styles it for the (dark) card; otherwise it
/// uses the brand tint for light backgrounds like the profile.
struct InterestChip: View {
    let text: String
    var onDark = true

    var body: some View {
        Text(text)
            .font(.caption2.weight(.medium))
            .padding(.horizontal, 9)
            .padding(.vertical, 5)
            .background(onDark ? AnyShapeStyle(.white.opacity(0.22))
                               : AnyShapeStyle(Theme.brand.opacity(0.12)),
                        in: Capsule())
            .foregroundStyle(onDark ? AnyShapeStyle(.white) : AnyShapeStyle(Theme.brand))
    }
}

/// A pill showing what a member is looking for.
struct LookingForTag: View {
    let lookingFor: LookingFor
    var onDark = true

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: lookingFor.symbol)
            Text(lookingFor.label)
        }
        .font(.caption2.weight(.semibold))
        .padding(.horizontal, 9)
        .padding(.vertical, 5)
        .background(onDark ? AnyShapeStyle(.white.opacity(0.22))
                           : AnyShapeStyle(Theme.brand.opacity(0.12)),
                    in: Capsule())
        .foregroundStyle(onDark ? AnyShapeStyle(.white) : AnyShapeStyle(Theme.brand))
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
