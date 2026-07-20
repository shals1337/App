import SwiftUI

/// A simple one-on-one conversation with a match. Replies are local-only
/// (no backend); the member's messages are persisted.
struct ChatView: View {
    @EnvironmentObject private var state: AppState
    let matchID: UUID
    @State private var draft = ""

    private var match: Match? {
        state.matches.first { $0.id == matchID }
    }

    var body: some View {
        VStack(spacing: 0) {
            if let match {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 10) {
                            MatchHeader(candidate: match.candidate)
                                .padding(.bottom, 8)
                            ForEach(match.messages) { message in
                                MessageBubble(message: message)
                                    .id(message.id)
                            }
                        }
                        .padding()
                    }
                    .onChange(of: match.messages.count) {
                        if let last = match.messages.last {
                            withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                        }
                    }
                }
                composer
            } else {
                ContentUnavailableView("Conversation unavailable", systemImage: "bubble.left")
            }
        }
        .navigationTitle(match?.candidate.name ?? "Chat")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var composer: some View {
        HStack(spacing: 10) {
            TextField("Message…", text: $draft, axis: .vertical)
                .lineLimit(1...4)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Color(.secondarySystemBackground), in: Capsule())

            Button {
                state.send(draft, to: matchID)
                draft = ""
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(Theme.brand)
            }
            .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding(10)
        .background(.bar)
    }
}

private struct MatchHeader: View {
    let candidate: Candidate

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
            Text("You matched with \(candidate.name)")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            ProfessionBadge(profession: candidate.profession)
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
