import SwiftUI

/// The Elite "Kan lide dig" grid — members who already liked you. Members
/// without Elite see them blurred behind an upgrade prompt.
struct LikesYouView: View {
    @EnvironmentObject private var state: AppState
    @State private var paywall: PaywallReason?

    private let columns = [GridItem(.flexible(), spacing: 12),
                           GridItem(.flexible(), spacing: 12)]

    var body: some View {
        NavigationStack {
            Group {
                let candidates = state.likesYouCandidates
                if candidates.isEmpty {
                    ContentUnavailableView {
                        Label("Ingen likes endnu", systemImage: "star")
                    } description: {
                        Text("Når nogen liker dig, dukker de op her. Bliv ved med at swipe.")
                    }
                } else {
                    ScrollView {
                        if !state.entitlements.canSeeLikesYou {
                            goldBanner
                        }
                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(candidates) { candidate in
                                LikeTile(candidate: candidate,
                                         revealed: state.entitlements.canSeeLikesYou)
                                    .onTapGesture {
                                        if state.entitlements.canSeeLikesYou {
                                            state.like(candidate)   // instant match
                                        } else {
                                            paywall = .seeLikesYou
                                        }
                                    }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Kan lide dig")
            .sheet(item: $paywall) { reason in
                PaywallView(reason: reason)
            }
        }
    }

    private var goldBanner: some View {
        Button { paywall = .seeLikesYou } label: {
            HStack(spacing: 12) {
                Image(systemName: "crown.fill")
                    .foregroundStyle(Tier.gold.accent)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Se hvem der kan lide dig")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text("Opgrader til Elite og match med det samme.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right").foregroundStyle(.secondary)
            }
            .padding()
            .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16))
            .padding([.horizontal, .top])
        }
        .buttonStyle(.plain)
    }
}

private struct LikeTile: View {
    let candidate: Candidate
    let revealed: Bool

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            Theme.cardGradient(seed: candidate.gradientSeed)
            Image(systemName: "person.fill")
                .font(.system(size: 90))
                .foregroundStyle(.white.opacity(0.18))

            LinearGradient(colors: [.clear, .black.opacity(0.6)],
                           startPoint: .center, endPoint: .bottom)

            if revealed {
                VStack(alignment: .leading, spacing: 6) {
                    ProfessionBadge(profession: candidate.profession)
                    Text("\(candidate.name), \(candidate.age)")
                        .font(.headline)
                        .foregroundStyle(.white)
                }
                .padding(12)
            } else {
                VStack(spacing: 6) {
                    Image(systemName: "lock.fill")
                    Text("\(candidate.profession.label)")
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .aspectRatio(0.8, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .blur(radius: revealed ? 0 : 14)
        .overlay {
            if !revealed {
                Image(systemName: "lock.fill")
                    .font(.title)
                    .foregroundStyle(.white)
                    .shadow(radius: 4)
            }
        }
    }
}
