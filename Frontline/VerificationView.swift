import SwiftUI
import PhotosUI

/// The verification centre. Frontline requires two checks:
///   1. **Photo / selfie** — confirms you're a real person and match your pics.
///   2. **Profession / work-ID** — confirms you belong to a vetted frontline job.
///
/// NOTE: both are simulated. Uploaded images are never stored or shown; we just
/// flip a flag after a short "review". For a real release, send the image to an
/// identity provider (e.g. a liveness + document-check API) and set the flags
/// from its verified callback.
struct VerificationView: View {
    @EnvironmentObject private var state: AppState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    banner

                    VerificationCard(
                        title: "Foto-verificering",
                        subtitle: "Tag en selfie, så vi kan bekræfte, at du er dig. Dit billede vises aldrig på din profil.",
                        systemImage: "person.crop.circle.badge.checkmark",
                        done: state.user?.photoVerified == true,
                        actionTitle: "Vælg selfie",
                        onVerified: { state.verifyPhoto() }
                    )

                    VerificationCard(
                        title: "Erhvervs-verificering",
                        subtitle: "Upload dit arbejds-ID eller personalekort. En medarbejder bekræfter det inden for 24 timer.",
                        systemImage: "checkmark.seal",
                        done: state.user?.isVerified == true,
                        actionTitle: "Upload arbejds-ID",
                        onVerified: { state.verifyProfession() }
                    )

                    Text("Sådan holder vi Frontline ægte: kun verificerede, essentielle fagfolk kommer ind.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, 4)
                }
                .padding()
            }
            .navigationTitle("Verificering")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Færdig") { dismiss() }
                }
            }
        }
    }

    private var banner: some View {
        let fully = state.user?.isFullyVerified == true
        return HStack(spacing: 12) {
            Image(systemName: fully ? "checkmark.shield.fill" : "shield.lefthalf.filled")
                .font(.title)
                .foregroundStyle(fully ? Color.green : Theme.brand)
            VStack(alignment: .leading, spacing: 2) {
                Text(fully ? "Du er fuldt verificeret" : "Færdiggør din verificering")
                    .font(.headline)
                Text(fully ? "Dit blå segl vises nu på din profil og dine kort."
                           : "Verificerede profiler får flere og bedre matches.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16))
    }
}

/// A single verification step with a photo picker and a simulated review.
private struct VerificationCard: View {
    let title: String
    let subtitle: String
    let systemImage: String
    let done: Bool
    let actionTitle: String
    let onVerified: () -> Void

    @State private var item: PhotosPickerItem?
    @State private var reviewing = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: done ? "checkmark.seal.fill" : systemImage)
                    .font(.title2)
                    .foregroundStyle(done ? Color.green : Theme.brand)
                Text(title).font(.headline)
                Spacer()
                if done {
                    Text("Verificeret")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.green)
                }
            }
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            if done {
                Label("Godkendt", systemImage: "checkmark.circle.fill")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Color.green)
            } else if reviewing {
                HStack(spacing: 8) {
                    ProgressView()
                    Text("Sender til gennemgang…")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            } else {
                PhotosPicker(selection: $item, matching: .images) {
                    Label(actionTitle, systemImage: "square.and.arrow.up")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Theme.brand.opacity(0.12), in: Capsule())
                        .foregroundStyle(Theme.brand)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16))
        .onChange(of: item) { _, newValue in
            guard newValue != nil, !done else { return }
            reviewing = true
            // Simulate the review; the image itself is intentionally discarded.
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
                reviewing = false
                item = nil
                onVerified()
            }
        }
    }
}
