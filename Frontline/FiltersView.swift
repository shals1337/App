import SwiftUI

/// Discovery preferences: who to show, age range, and maximum distance.
/// Saving rebuilds the deck through `AppState.updateProfile`.
struct FiltersView: View {
    @EnvironmentObject private var state: AppState
    @Environment(\.dismiss) private var dismiss
    @State private var draft: UserProfile
    @State private var paywall: PaywallReason?

    init(profile: UserProfile) {
        _draft = State(initialValue: profile)
    }

    private var advanced: Bool { state.entitlements.canUseAdvancedFilters }

    var body: some View {
        NavigationStack {
            Form {
                // Free filters.
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

                // Advanced (paid) filters.
                if advanced {
                    Section("Fag") {
                        ForEach(Profession.allCases) { profession in
                            Toggle(isOn: binding(forProfession: profession)) {
                                Label(profession.label, systemImage: profession.symbol)
                            }
                        }
                    }
                    Section("Arbejdstider") {
                        ForEach(WorkSchedule.allCases) { schedule in
                            Toggle(isOn: binding(forSchedule: schedule)) {
                                Label(schedule.label, systemImage: schedule.symbol)
                            }
                        }
                    }
                } else {
                    Section {
                        Button {
                            paywall = .general
                        } label: {
                            HStack {
                                Label("Filtrér på fag og arbejdstider", systemImage: "lock.fill")
                                Spacer()
                                Text("Premium").font(.caption.weight(.semibold))
                                    .foregroundStyle(Tier.plus.accent)
                            }
                        }
                    } header: {
                        Text("Avancerede filtre")
                    } footer: {
                        Text("Alder og afstand er gratis. Med Premium kan du også filtrere på fag og arbejdstider — f.eks. finde en, der også er på nattevagt.")
                    }
                }

                Section {
                    Toggle("Aktivér swipe-bevægelser", isOn: $draft.swipeEnabled)
                } header: {
                    Text("Interaktion")
                } footer: {
                    Text("Som standard bruger du knapperne til at like, sige nej og fremhæve. Du kan slå swipe til, hvis du foretrækker det.")
                }
            }
            .sheet(item: $paywall) { PaywallView(reason: $0) }
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

    private func binding(forProfession profession: Profession) -> Binding<Bool> {
        Binding(
            get: { draft.filterProfessions.contains(profession) },
            set: { isOn in
                if isOn {
                    if !draft.filterProfessions.contains(profession) { draft.filterProfessions.append(profession) }
                } else {
                    draft.filterProfessions.removeAll { $0 == profession }
                }
            }
        )
    }

    private func binding(forSchedule schedule: WorkSchedule) -> Binding<Bool> {
        Binding(
            get: { draft.filterSchedules.contains(schedule) },
            set: { isOn in
                if isOn {
                    if !draft.filterSchedules.contains(schedule) { draft.filterSchedules.append(schedule) }
                } else {
                    draft.filterSchedules.removeAll { $0 == schedule }
                }
            }
        )
    }
}
