import SwiftUI

/// The swipe deck. The top card is draggable; buttons mirror the gesture.
/// Swipe right / left / up = like / nope / super like — just like Tinder,
/// with daily quotas and premium gates enforced through `AppState`.
struct DiscoverView: View {
    @EnvironmentObject private var state: AppState
    @State private var drag: CGSize = .zero
    @State private var paywall: PaywallReason?
    @State private var showFilters = false

    private var swipeEnabled: Bool { state.user?.swipeEnabled == true }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground).ignoresSafeArea()

                VStack(spacing: 0) {
                    brandBar
                    if state.deck.isEmpty {
                        EmptyDeck()
                    } else {
                        deck
                    }
                }
            }
            .navigationBarHidden(true)
            .sensoryFeedback(.selection, trigger: state.deck.count)
            .sensoryFeedback(.success, trigger: state.newMatch?.id)
            .overlay {
                if let match = state.newMatch {
                    MatchCelebration(match: match) { state.newMatch = nil }
                        .transition(.opacity)
                }
            }
            .animation(.easeInOut(duration: 0.25), value: state.newMatch?.id)
            .sheet(item: $paywall) { PaywallView(reason: $0) }
            .sheet(isPresented: $showFilters) {
                if let user = state.user { FiltersView(profile: user) }
            }
        }
    }

    private var brandBar: some View {
        HStack {
            Button {
                if state.entitlements.boostsPerMonth > 0 { state.activateBoost() }
                else { paywall = .boost }
            } label: {
                Image(systemName: state.isBoosted ? "arrow.up.circle.fill" : "arrow.up.circle")
                    .font(.title3)
                    .foregroundStyle(state.isBoosted ? Tier.gold.accent : .secondary)
            }

            Spacer()

            HStack(spacing: 7) {
                Image(systemName: "checkmark.shield.fill")
                Text("Frontline").font(.title2.weight(.heavy))
            }
            .foregroundStyle(Theme.brandGradient)

            Spacer()

            Button { showFilters = true } label: {
                Image(systemName: "slider.horizontal.3")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 10)
    }

    private var deck: some View {
        VStack(spacing: 0) {
            ZStack {
                ForEach(Array(state.deck.prefix(3).enumerated()).reversed(), id: \.element.id) { index, candidate in
                    if index == 0 {
                        CardView(candidate: candidate, drag: drag)
                            .offset(drag)
                            .rotationEffect(.degrees(Double(drag.width / 18)))
                            // Swipe is opt-in; buttons are the primary control.
                            .gesture(swipeGesture(for: candidate),
                                     including: swipeEnabled ? .gesture : .none)
                    } else {
                        CardView(candidate: candidate)
                            .scaleEffect(1 - CGFloat(index) * 0.04)
                            .offset(y: CGFloat(index) * 12)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.top, 4)

            actionButtons
                .padding(.top, 14)

            quotaLine
                .padding(.top, 6)
                .padding(.bottom, 12)
        }
    }

    private var actionButtons: some View {
        HStack(spacing: 16) {
            CircleButton(symbol: "arrow.uturn.backward", tint: Theme.rewind, size: 48) {
                attemptRewind()
            }
            .disabled(state.hasRewindEntitlement && !state.canRewind)
            .opacity(state.hasRewindEntitlement && !state.canRewind ? 0.4 : 1)

            CircleButton(symbol: "xmark", tint: Theme.nope, size: 58) {
                guard let c = state.topCandidate else { return }
                fling(CGSize(width: -600, height: 0)) { state.pass(c) }
            }

            CircleButton(symbol: "star.fill", tint: Theme.superLike, size: 48) {
                guard let c = state.topCandidate else { return }
                attemptSuperLike(c)
            }

            CircleButton(symbol: "heart.fill", tint: Theme.like, size: 58) {
                guard let c = state.topCandidate else { return }
                attemptLike(c)
            }
        }
    }

    /// A small line showing remaining likes (free tier) or the current plan.
    @ViewBuilder private var quotaLine: some View {
        if let remaining = state.likesRemaining {
            Button { paywall = .outOfLikes } label: {
                Text("\(remaining) likes tilbage i dag · Opgrader for ubegrænset")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        } else {
            Label("\(state.tier.shortLabel) · ubegrænsede likes", systemImage: "infinity")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Actions with quota / entitlement gates

    private func attemptLike(_ candidate: Candidate) {
        guard state.canLike else {
            paywall = .outOfLikes
            withAnimation(.spring) { drag = .zero }
            return
        }
        fling(CGSize(width: 600, height: drag.height)) { state.like(candidate) }
    }

    private func attemptSuperLike(_ candidate: Candidate) {
        guard state.canSuperLike else {
            paywall = .outOfSuperLikes
            withAnimation(.spring) { drag = .zero }
            return
        }
        fling(CGSize(width: 0, height: -700)) { state.like(candidate, superLike: true) }
    }

    private func attemptRewind() {
        guard state.hasRewindEntitlement else { paywall = .rewind; return }
        guard state.canRewind else { return }
        withAnimation(.spring) { state.rewind() }
    }

    // MARK: - Gesture

    private func swipeGesture(for candidate: Candidate) -> some Gesture {
        DragGesture()
            .onChanged { drag = $0.translation }
            .onEnded { value in
                let h = value.translation.width
                let v = value.translation.height
                if v < -130 && abs(v) > abs(h) {
                    attemptSuperLike(candidate)
                } else if h > 110 {
                    attemptLike(candidate)
                } else if h < -110 {
                    fling(CGSize(width: -600, height: v)) { state.pass(candidate) }
                } else {
                    withAnimation(.spring) { drag = .zero }
                }
            }
    }

    /// Animates the top card off-screen, then commits the decision.
    private func fling(_ target: CGSize, commit: @escaping () -> Void) {
        withAnimation(.easeOut(duration: 0.22)) { drag = target }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            commit()
            drag = .zero
        }
    }
}

private struct CircleButton: View {
    let symbol: String
    let tint: Color
    let size: CGFloat
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: size * 0.42, weight: .bold))
                .foregroundStyle(tint)
                .frame(width: size, height: size)
                .background(Color(.secondarySystemGroupedBackground), in: Circle())
                .overlay(Circle().strokeBorder(tint.opacity(0.18), lineWidth: 1))
                .shadow(color: .black.opacity(0.10), radius: 8, y: 4)
        }
        .buttonStyle(PressableButtonStyle())
    }
}

private struct EmptyDeck: View {
    var body: some View {
        Spacer()
        ContentUnavailableView {
            Label("Du er helt fanget op", systemImage: "sparkles")
        } description: {
            Text("Ingen flere medlemmer i nærheden lige nu. Prøv at udvide dine filtre, eller kig forbi igen senere.")
        }
        Spacer()
    }
}

/// Full-screen "I har matchet!" celebration with a spring entrance and confetti.
private struct MatchCelebration: View {
    @EnvironmentObject private var state: AppState
    let match: Match
    let dismiss: () -> Void

    @State private var appeared = false

    private var shared: [String] {
        guard let mine = state.user?.interests else { return [] }
        let set = Set(mine)
        return match.candidate.interests.filter { set.contains($0) }
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: [Theme.brandDeep.opacity(0.96), .black.opacity(0.92)],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
                .onTapGesture { dismiss() }

            VStack(spacing: 22) {
                Text("I HAR MATCHET!")
                    .font(.system(size: 34, weight: .heavy))
                    .tracking(1.5)
                    .foregroundStyle(.white)
                    .scaleEffect(appeared ? 1 : 0.5)
                    .opacity(appeared ? 1 : 0)

                avatars
                    .scaleEffect(appeared ? 1 : 0.4)

                VStack(spacing: 6) {
                    Text("Du og \(match.candidate.name) kan lide hinanden.")
                        .font(.headline)
                        .foregroundStyle(.white)
                    if !shared.isEmpty {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                            Text("I deler: \(shared.prefix(3).joined(separator: ", "))")
                        }
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.85))
                    }
                }
                .multilineTextAlignment(.center)
                .opacity(appeared ? 1 : 0)

                VStack(spacing: 12) {
                    Button(action: dismiss) {
                        Label("Sig hej", systemImage: "bubble.left.fill")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.white)
                    .foregroundStyle(Theme.brandDeep)

                    Button("Fortsæt", action: dismiss)
                        .foregroundStyle(.white.opacity(0.85))
                }
                .padding(.horizontal, 50)
                .opacity(appeared ? 1 : 0)
            }
            .padding()

            ConfettiView()
                .ignoresSafeArea()
                .opacity(appeared ? 1 : 0)
        }
        .onAppear {
            withAnimation(.spring(response: 0.55, dampingFraction: 0.6)) { appeared = true }
        }
    }

    private var avatars: some View {
        ZStack {
            HStack(spacing: -26) {
                AvatarBubble(monogram: String((state.user?.name ?? "?").prefix(1)).uppercased(),
                             fill: AnyShapeStyle(Theme.brandGradient), symbol: nil)
                    .zIndex(1)
                AvatarBubble(monogram: nil,
                             fill: AnyShapeStyle(Theme.cardGradient(seed: match.candidate.gradientSeed)),
                             symbol: match.candidate.profession.symbol)
            }
            Circle()
                .fill(.white)
                .frame(width: 46, height: 46)
                .overlay(Image(systemName: "heart.fill").foregroundStyle(Theme.brand))
                .shadow(color: .black.opacity(0.2), radius: 6, y: 2)
        }
    }
}

/// A round avatar showing either a monogram or a profession symbol.
private struct AvatarBubble: View {
    let monogram: String?
    let fill: AnyShapeStyle
    let symbol: String?

    var body: some View {
        ZStack {
            Circle().fill(fill)
            if let monogram {
                Text(monogram)
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            } else if let symbol {
                Image(systemName: symbol)
                    .font(.system(size: 34))
                    .foregroundStyle(.white)
            }
        }
        .frame(width: 104, height: 104)
        .overlay(Circle().strokeBorder(.white.opacity(0.85), lineWidth: 3))
    }
}
