import SwiftUI

/// The manual verification review queue. An administrator (you) inspects each
/// applicant's submitted work-ID / selfie and approves or rejects it — nothing
/// is auto-approved. In this local demo the queue mixes the signed-in member's
/// own pending submissions with a few sample applicants.
///
/// For production this screen would be a separate, access-controlled admin
/// tool backed by a server; the images would be shown from secure storage and
/// every decision audit-logged.
struct AdminView: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        NavigationStack {
            Group {
                let queue = state.adminQueue
                if queue.isEmpty {
                    ContentUnavailableView {
                        Label("Ingen ventende anmodninger", systemImage: "checkmark.seal")
                    } description: {
                        Text("Alt er gennemgået. Nye anmodninger dukker op her.")
                    }
                } else {
                    ScrollView {
                        VStack(spacing: 14) {
                            ForEach(queue) { applicant in
                                ReviewCard(applicant: applicant,
                                           approve: { state.approve(applicant) },
                                           reject: { state.reject(applicant) })
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Verificeringer")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct ReviewCard: View {
    let applicant: AdminApplicant
    let approve: () -> Void
    let reject: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                ZStack {
                    Circle().fill(Theme.cardGradient(seed: applicant.gradientSeed))
                        .frame(width: 46, height: 46)
                    Image(systemName: applicant.profession.symbol).foregroundStyle(.white)
                }
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Text(applicant.name).font(.headline)
                        if applicant.isCurrentUser {
                            Text("(dig)").font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    ProfessionBadge(profession: applicant.profession)
                }
                Spacer()
            }

            // Placeholder for the submitted document (never shown in the demo).
            HStack(spacing: 10) {
                Image(systemName: applicant.kind == .photo ? "person.crop.square" : "doc.text.image")
                    .font(.title2)
                    .foregroundStyle(Theme.brand)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Indsendt: \(applicant.kind.label)").font(.subheadline.weight(.medium))
                    Text("Billede skjult i denne demo").font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
            }
            .padding(12)
            .background(Color(.tertiarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 12))

            HStack(spacing: 10) {
                Button(role: .destructive, action: reject) {
                    Label("Afvis", systemImage: "xmark")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button(action: approve) {
                    Label("Godkend", systemImage: "checkmark")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16))
    }
}
