import SwiftUI

/// Discovery preferences: who to show, age range, and maximum distance.
/// Saving rebuilds the deck through `AppState.updateProfile`.
struct FiltersView: View {
    @EnvironmentObject private var state: AppState
    @Environment(\.dismiss) private var dismiss
    @State private var draft: UserProfile

    init(profile: UserProfile) {
        _draft = State(initialValue: profile)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Vis mig") {
                    ForEach(Gender.allCases) { gender in
                        Toggle(gender.label, isOn: binding(for: gender))
                    }
                }

                Section("Alder: \(draft.minAge)–\(draft.maxAge)") {
                    Stepper("Yngste: \(draft.minAge)", value: $draft.minAge, in: 18...draft.maxAge)
                    Stepper("Ældste: \(draft.maxAge)", value: $draft.maxAge, in: draft.minAge...80)
                }

                Section("Maksimal afstand: \(draft.maxDistanceKm) km") {
                    Slider(
                        value: Binding(
                            get: { Double(draft.maxDistanceKm) },
                            set: { draft.maxDistanceKm = Int($0) }
                        ),
                        in: 1...200, step: 1
                    )
                }
            }
            .navigationTitle("Filtre")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuller") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Anvend") {
                        var cleaned = draft
                        if cleaned.seeking.isEmpty { cleaned.seeking = Gender.allCases }
                        state.updateProfile(cleaned)
                        dismiss()
                    }
                }
            }
        }
    }

    private func binding(for gender: Gender) -> Binding<Bool> {
        Binding(
            get: { draft.seeking.contains(gender) },
            set: { isOn in
                if isOn {
                    if !draft.seeking.contains(gender) { draft.seeking.append(gender) }
                } else {
                    draft.seeking.removeAll { $0 == gender }
                }
            }
        )
    }
}
