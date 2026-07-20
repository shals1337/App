import SwiftUI

/// The swipe deck. The top card is draggable; buttons mirror the gesture.
/// Swipe right / left / up = like / nope / super like — just like Tinder.
struct DiscoverView: View {
    @EnvironmentObject private var state: AppState
    @State private var drag: CGSize = .zero

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
            .overlay {
                if let match = state.newMatch {
                    MatchCelebration(match: match) {
                        state.newMatch = nil
                    }
                }
            }
        }
    }

    private var brandBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "flame.fill")
                .foregroundStyle(Theme.brandGradient)
            Text("frontline")
                .font(.title2.weight(.heavy))
                .foregroundStyle(Theme.brandGradient)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
    }

    private var deck: some View {
        VStack(spacing: 0) {
            ZStack {
                // Show up to three cards; only the top one is interactive.
                ForEach(Array(state.deck.prefix(3).enumerated()).reversed(), id: \.element.id) { index, candidate in
                    if index == 0 {
                        CardView(candidate: candidate, drag: drag)
                            .offset(drag)
                            .rotationEffect(.degrees(Double(drag.width / 18)))
                            .gesture(swipeGesture(for: candidate))
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
                .padding(.vertical, 16)
        }
    }

    private var actionButtons: some View {
        HStack(spacing: 18) {
            CircleButton(symbol: "arrow.uturn.backward", tint: Theme.rewind, size: 48) {
                withAnimation(.spring) { state.rewind() }
            }
            .disabled(!state.canRewind)
            .opacity(state.canRewind ? 1 : 0.4)

            CircleButton(symbol: "xmark", tint: Theme.nope, size: 60) {
                guard let c = state.topCandidate else { return }
                fling(CGSize(width: -600, height: 0)) { state.pass(c) }
            }

            CircleButton(symbol: "star.fill", tint: Theme.superLike, size: 48) {
                guard let c = state.topCandidate else { return }
                fling(CGSize(width: 0, height: -700)) { state.like(c, superLike: true) }
            }

            CircleButton(symbol: "heart.fill", tint: Theme.like, size: 60) {
                guard let c = state.topCandidate else { return }
                fling(CGSize(width: 600, height: 0)) { state.like(c) }
            }
        }
    }

    // MARK: - Gesture

    private func swipeGesture(for candidate: Candidate) -> some Gesture {
        DragGesture()
            .onChanged { drag = $0.translation }
            .onEnded { value in
                let h = value.translation.width
                let v = value.translation.height
                let sideThreshold: CGFloat = 110
                let upThreshold: CGFloat = 130

                if v < -upThreshold && abs(v) > abs(h) {
                    fling(CGSize(width: 0, height: -700)) { state.like(candidate, superLike: true) }
                } else if h > sideThreshold {
                    fling(CGSize(width: 600, height: v)) { state.like(candidate) }
                } else if h < -sideThreshold {
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
    }
}

private struct EmptyDeck: View {
    var body: some View {
        Spacer()
        ContentUnavailableView {
            Label("Du er helt fanget op", systemImage: "sparkles")
        } description: {
            Text("Ingen flere medlemmer i nærheden lige nu. Kig forbi igen — nye frontliners kommer til hver dag.")
        }
        Spacer()
    }
}

/// Full-screen "Det er et match!" celebration.
private struct MatchCelebration: View {
    let match: Match
    let dismiss: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.78).ignoresSafeArea()
            VStack(spacing: 20) {
                Text("Det er et match!")
                    .font(.system(size: 34, weight: .heavy))
                    .foregroundStyle(Theme.brandGradient)
                Text("Du og \(match.candidate.name) kan lide hinanden.")
                    .foregroundStyle(.white.opacity(0.9))

                CardView(candidate: match.candidate)
                    .frame(height: 320)
                    .padding(.horizontal, 60)

                Button(action: dismiss) {
                    Text("Sig hej")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal, 60)

                Button("Fortsæt med at swipe", action: dismiss)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding()
        }
        .transition(.opacity)
    }
}
