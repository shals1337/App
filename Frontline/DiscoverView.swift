import SwiftUI

/// The swipe deck. The top card is draggable; buttons mirror the gesture.
struct DiscoverView: View {
    @EnvironmentObject private var state: AppState
    @State private var drag: CGSize = .zero

    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground).ignoresSafeArea()

                if state.deck.isEmpty {
                    EmptyDeck()
                } else {
                    deck
                }
            }
            .navigationTitle("Discover")
            .navigationBarTitleDisplayMode(.inline)
            .overlay {
                if let match = state.newMatch {
                    MatchCelebration(match: match) {
                        state.newMatch = nil
                    }
                }
            }
        }
    }

    private var deck: some View {
        VStack {
            ZStack {
                // Show up to three cards; only the top one is interactive.
                ForEach(Array(state.deck.prefix(3).enumerated()).reversed(), id: \.element.id) { index, candidate in
                    if index == 0 {
                        CardView(candidate: candidate, dragWidth: drag.width)
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
            .padding(.horizontal, 20)
            .padding(.top, 8)

            actionButtons
                .padding(.vertical, 20)
        }
    }

    private var actionButtons: some View {
        HStack(spacing: 40) {
            CircleButton(symbol: "xmark", tint: .red) {
                if let c = state.topCandidate { animateSwipe(-1); state.pass(c); resetDrag() }
            }
            CircleButton(symbol: "heart.fill", tint: .green, large: true) {
                if let c = state.topCandidate { animateSwipe(1); state.like(c); resetDrag() }
            }
        }
    }

    // MARK: - Gesture

    private func swipeGesture(for candidate: Candidate) -> some Gesture {
        DragGesture()
            .onChanged { drag = $0.translation }
            .onEnded { value in
                let threshold: CGFloat = 110
                if value.translation.width > threshold {
                    withAnimation(.easeOut(duration: 0.2)) { drag.width = 600 }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.18) {
                        state.like(candidate); resetDrag()
                    }
                } else if value.translation.width < -threshold {
                    withAnimation(.easeOut(duration: 0.2)) { drag.width = -600 }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.18) {
                        state.pass(candidate); resetDrag()
                    }
                } else {
                    withAnimation(.spring) { drag = .zero }
                }
            }
    }

    private func animateSwipe(_ direction: CGFloat) {
        withAnimation(.easeOut(duration: 0.18)) { drag.width = 600 * direction }
    }

    private func resetDrag() { drag = .zero }
}

private struct CircleButton: View {
    let symbol: String
    let tint: Color
    var large = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: large ? 30 : 24, weight: .bold))
                .foregroundStyle(tint)
                .frame(width: large ? 72 : 60, height: large ? 72 : 60)
                .background(Color(.secondarySystemGroupedBackground), in: Circle())
                .shadow(color: .black.opacity(0.12), radius: 8, y: 4)
        }
    }
}

private struct EmptyDeck: View {
    var body: some View {
        ContentUnavailableView {
            Label("You're all caught up", systemImage: "sparkles")
        } description: {
            Text("No more members near you right now. Check back soon — new frontliners join every day.")
        }
    }
}

/// Full-screen "It's a match!" celebration.
private struct MatchCelebration: View {
    let match: Match
    let dismiss: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.75).ignoresSafeArea()
            VStack(spacing: 20) {
                Text("It's a match!")
                    .font(.system(size: 36, weight: .heavy))
                    .foregroundStyle(Theme.brandGradient)
                Text("You and \(match.candidate.name) liked each other.")
                    .foregroundStyle(.white.opacity(0.9))

                CardView(candidate: match.candidate)
                    .frame(height: 320)
                    .padding(.horizontal, 60)

                Button(action: dismiss) {
                    Text("Say hello")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal, 60)

                Button("Keep swiping", action: dismiss)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding()
        }
        .transition(.opacity)
    }
}
