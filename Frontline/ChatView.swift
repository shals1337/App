import SwiftUI

/// A one-on-one conversation with a match, with read receipts and a typing
/// indicator. Replies are simulated locally (no backend); your messages persist.
struct ChatView: View {
    @EnvironmentObject private var state: AppState
    let matchID: UUID
    @State private var draft = ""

    private var match: Match? {
        state.matches.first { $0.id == matchID }
    }
    private var isTyping: Bool { state.typingMatchID == matchID }

    var body: some View {
        VStack(spacing: 0) {
            if let match {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 8) {
                            MatchHeader(candidate: match.candidate)
                                .padding(.bottom, 8)

                            ForEach(Array(match.messages.enumerated()), id: \.element.id) { index, message in
                                VStack(alignment: .trailing, spacing: 2) {
                                    MessageBubble(message: message)
                                    receipt(for: message, isLast: index == match.messages.count - 1)
                                }
                                .id(message.id)
                                .transition(.asymmetric(
                                    insertion: .push(from: message.fromMe ? .trailing : .leading)
                                        .combined(with: .opacity),
                                    removal: .opacity))
                            }

                            if isTyping {
                                TypingBubble()
                                    .id("typing")
                                    .transition(.scale(scale: 0.6, anchor: .bottomLeading).combined(with: .opacity))
                            }
                        }
                        .padding()
                        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: match.messages)
                        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: isTyping)
                    }
                    .scrollDismissesKeyboard(.interactively)
                    .onChange(of: match.messages.count) { scrollToBottom(proxy) }
                    .onChange(of: isTyping) { scrollToBottom(proxy) }
                }
                composer
            } else {
                ContentUnavailableView("Samtalen er utilgængelig", systemImage: "bubble.left")
            }
        }
        .navigationTitle(match?.candidate.name ?? "Chat")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func scrollToBottom(_ proxy: ScrollViewProxy) {
        withAnimation(.easeOut(duration: 0.25)) {
            if isTyping {
                proxy.scrollTo("typing", anchor: .bottom)
            } else if let last = match?.messages.last {
                proxy.scrollTo(last.id, anchor: .bottom)
            }
        }
    }

    /// The "Sendt / Set" line under the most recent message you sent.
    @ViewBuilder
    private func receipt(for message: Message, isLast: Bool) -> some View {
        if message.fromMe && isLast {
            HStack(spacing: 3) {
                Image(systemName: message.seen ? "checkmark.circle.fill" : "checkmark.circle")
                    .font(.system(size: 10))
                Text(message.seen ? "Set" : "Sendt")
                    .font(.caption2)
            }
            .foregroundStyle(message.seen ? Theme.brand : Color.secondary)
            .padding(.trailing, 4)
            .transition(.opacity)
        }
    }

    private var composer: some View {
        HStack(spacing: 10) {
            TextField("Besked…", text: $draft, axis: .vertical)
                .lineLimit(1...4)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Color(.secondarySystemBackground), in: Capsule())

            Button {
                let text = draft
                draft = ""
                state.send(text, to: matchID)
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(canSend ? AnyShapeStyle(Theme.brandGradient)
                                             : AnyShapeStyle(Color.secondary))
                    .scaleEffect(canSend ? 1 : 0.9)
                    .animation(.spring(response: 0.3, dampingFraction: 0.6), value: canSend)
            }
            .disabled(!canSend)
            .sensoryFeedback(.impact(weight: .light), trigger: match?.messages.count ?? 0)
        }
        .padding(10)
        .background(.bar)
    }

    private var canSend: Bool {
        !draft.trimmingCharacters(in: .whitespaces).isEmpty
    }
}

private struct MatchHeader: View {
    let candidate: Candidate
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(Theme.cardGradient(seed: candidate.gradientSeed))
                    .frame(width: 72, height: 72)
                Image(systemName: candidate.profession.symbol)
                    .font(.title2)
                    .foregroundStyle(.white)
            }
            .scaleEffect(appeared ? 1 : 0.6)
            .opacity(appeared ? 1 : 0)
            Text("Du matchede med \(candidate.name)")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            ProfessionBadge(profession: candidate.profession)
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) { appeared = true }
        }
    }
}

private struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack {
            if message.fromMe { Spacer(minLength: 40) }
            Text(message.text)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .foregroundStyle(message.fromMe ? .white : .primary)
                .background(
                    message.fromMe
                        ? AnyShapeStyle(Theme.brandGradient)
                        : AnyShapeStyle(Color(.secondarySystemBackground)),
                    in: RoundedRectangle(cornerRadius: 18)
                )
            if !message.fromMe { Spacer(minLength: 40) }
        }
    }
}

/// The bubble that holds the animated typing dots.
private struct TypingBubble: View {
    var body: some View {
        HStack {
            TypingDots()
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 18))
            Spacer(minLength: 40)
        }
    }
}
