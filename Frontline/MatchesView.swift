import SwiftUI

struct MatchesView: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        NavigationStack {
            Group {
                if state.matches.isEmpty {
                    ContentUnavailableView {
                        Label("Ingen matches endnu", systemImage: "heart.slash")
                    } description: {
                        Text("Gå til Udforsk og begynd at like folk. Når nogen liker dig tilbage, dukker de op her.")
                    }
                } else {
                    List {
                        ForEach(state.matches) { match in
                            NavigationLink(value: match.id) {
                                MatchRow(match: match)
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Matches")
            .navigationDestination(for: UUID.self) { id in
                ChatView(matchID: id)
            }
        }
    }
}

private struct MatchRow: View {
    let match: Match

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Theme.cardGradient(seed: match.candidate.gradientSeed))
                    .frame(width: 56, height: 56)
                Image(systemName: match.candidate.profession.symbol)
                    .foregroundStyle(.white)
            }
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(match.candidate.name).font(.headline)
                    Image(systemName: "checkmark.seal.fill")
                        .font(.caption2)
                        .foregroundStyle(match.candidate.profession.tint)
                }
                Text(lastLine)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
            Spacer()
        }
        .padding(.vertical, 4)
    }

    private var lastLine: String {
        guard let last = match.messages.last else { return "Sig hej 👋" }
        return (last.fromMe ? "Dig: " : "") + last.text
    }
}
