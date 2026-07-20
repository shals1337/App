import SwiftUI

/// Multi-step sign-up. Frontline is invite-only in spirit: the member must
/// pick one of the vetted professions and pass a (mock) work-ID check before
/// they can enter the app.
struct OnboardingView: View {
    @EnvironmentObject private var state: AppState

    @State private var step = 0
    @State private var draft = UserProfile.empty
    @State private var verifying = false

    private let lastStep = 3

    var body: some View {
        VStack(spacing: 0) {
            header
            ProgressView(value: Double(step + 1), total: Double(lastStep + 1))
                .tint(Theme.brand)
                .padding(.horizontal)

            TabView(selection: $step) {
                basicsStep.tag(0)
                professionStep.tag(1)
                preferencesStep.tag(2)
                verifyStep.tag(3)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: step)

            footer
        }
        .background(Color(.systemGroupedBackground))
    }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 6) {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.shield.fill")
                    .font(.title2)
                    .foregroundStyle(Theme.brandGradient)
                Text("Frontline")
                    .font(.title2.bold())
            }
            Text("Dating for dem, der møder op")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 24)
        .padding(.bottom, 12)
    }

    // MARK: - Steps

    private var basicsStep: some View {
        StepScroll(title: "Det basale",
                   subtitle: "Sådan vises du for andre medlemmer.") {
            LabeledField("Fornavn") {
                TextField("f.eks. Mette", text: $draft.name)
                    .textInputAutocapitalization(.words)
            }
            LabeledField("Alder") {
                Stepper("\(draft.age)", value: $draft.age, in: 18...99)
            }
            LabeledField("Jeg er") {
                Picker("Køn", selection: $draft.gender) {
                    ForEach(Gender.allCases) { Text($0.label).tag($0) }
                }
                .pickerStyle(.segmented)
            }
            LabeledField("By") {
                TextField("f.eks. København", text: $draft.city)
                    .textInputAutocapitalization(.words)
            }
        }
    }

    private var professionStep: some View {
        StepScroll(title: "Dit erhverv",
                   subtitle: "Frontline er kun for essentielle fagfolk og omsorgspersoner. Vælg det, der passer bedst.") {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(Profession.allCases) { profession in
                    ProfessionChip(profession: profession,
                                   selected: draft.profession == profession)
                        .onTapGesture { draft.profession = profession }
                }
            }
        }
    }

    private var preferencesStep: some View {
        StepScroll(title: "Hvem vil du møde",
                   subtitle: "Du kan altid ændre det.") {
            LabeledField("Vis mig") {
                VStack(spacing: 8) {
                    ForEach(Gender.allCases) { gender in
                        SeekingRow(gender: gender,
                                   isOn: draft.seeking.contains(gender)) {
                            toggleSeeking(gender)
                        }
                    }
                }
            }
            LabeledField("Om dig") {
                TextField("Del noget ægte…", text: $draft.bio, axis: .vertical)
                    .lineLimit(3...6)
            }
        }
    }

    private var verifyStep: some View {
        StepScroll(title: "Bekræft at du hører til",
                   subtitle: "Alle medlemmer bekræfter deres erhverv, så fællesskabet forbliver ægte. I denne demo simulerer vi tjekket af dit arbejds-ID.") {
            VStack(spacing: 20) {
                ZStack {
                    Circle()
                        .fill(draft.profession.tint.opacity(0.15))
                        .frame(width: 120, height: 120)
                    Image(systemName: verifying ? "checkmark.seal.fill" : draft.profession.symbol)
                        .font(.system(size: 48))
                        .foregroundStyle(draft.profession.tint)
                        .contentTransition(.symbolEffect(.replace))
                }
                Text(draft.profession.label)
                    .font(.headline)

                VStack(spacing: 10) {
                    verifyBullet("Upload et billede af dit arbejds-ID eller skilt")
                    verifyBullet("En medarbejder bekræfter det inden for 24 timer")
                    verifyBullet("Dit dokument vises aldrig på din profil")
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
        }
    }

    private func verifyBullet(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(Theme.brand)
            Text(text)
                .font(.subheadline)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    // MARK: - Footer

    private var footer: some View {
        VStack(spacing: 12) {
            if let message = validationMessage {
                Text(message)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            HStack {
                if step > 0 {
                    Button("Tilbage") { withAnimation { step -= 1 } }
                        .buttonStyle(.bordered)
                }
                Button(action: advance) {
                    Text(step == lastStep ? (verifying ? "Bekræfter…" : "Bekræft & gå ind") : "Fortsæt")
                        .frame(maxWidth: .infinity)
                        .fontWeight(.semibold)
                }
                .buttonStyle(.borderedProminent)
                .disabled(!canAdvance || verifying)
            }
        }
        .padding()
    }

    // MARK: - Logic

    private func toggleSeeking(_ gender: Gender) {
        if let idx = draft.seeking.firstIndex(of: gender) {
            draft.seeking.remove(at: idx)
        } else {
            draft.seeking.append(gender)
        }
    }

    private var canAdvance: Bool { validationMessage == nil }

    private var validationMessage: String? {
        switch step {
        case 0:
            if draft.name.trimmingCharacters(in: .whitespaces).isEmpty {
                return "Tilføj dit fornavn for at fortsætte."
            }
            if draft.city.trimmingCharacters(in: .whitespaces).isEmpty {
                return "Tilføj din by for at fortsætte."
            }
            return nil
        case 2:
            return draft.seeking.isEmpty ? "Vælg mindst én, du vil se." : nil
        default:
            return nil
        }
    }

    private func advance() {
        guard canAdvance else { return }
        if step < lastStep {
            withAnimation { step += 1 }
        } else {
            // Simulate the verification round-trip, then enter the app.
            verifying = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.1) {
                state.completeOnboarding(draft)
            }
        }
    }
}

// MARK: - Reusable pieces

/// A titled, scrollable step container.
private struct StepScroll<Content: View>: View {
    let title: String
    let subtitle: String
    @ViewBuilder var content: Content

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(title).font(.title.bold())
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                content
            }
            .padding()
        }
    }
}

private struct LabeledField<Content: View>: View {
    let label: String
    @ViewBuilder var content: Content

    init(_ label: String, @ViewBuilder content: () -> Content) {
        self.label = label
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label.uppercased())
                .font(.caption.bold())
                .foregroundStyle(.secondary)
            content
                .padding(12)
                .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 12))
        }
    }
}

struct ProfessionChip: View {
    let profession: Profession
    let selected: Bool

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: profession.symbol)
                .font(.title2)
                .foregroundStyle(selected ? .white : profession.tint)
            Text(profession.label)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(selected ? .white : .primary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, minHeight: 96)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(selected ? AnyShapeStyle(profession.tint) : AnyShapeStyle(Color(.secondarySystemGroupedBackground)))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(selected ? Color.clear : Color(.separator), lineWidth: 1)
        )
        .scaleEffect(selected ? 1.04 : 1)
        .shadow(color: selected ? profession.tint.opacity(0.4) : .clear, radius: 10, y: 4)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: selected)
    }
}

private struct SeekingRow: View {
    let gender: Gender
    let isOn: Bool
    let toggle: () -> Void

    var body: some View {
        Button(action: toggle) {
            HStack {
                Text(gender.label)
                    .foregroundStyle(.primary)
                Spacer()
                Image(systemName: isOn ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isOn ? Theme.brand : Color.secondary)
            }
        }
        .buttonStyle(.plain)
    }
}
