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
                Image(systemName: "heart.fill")
                    .font(.title2)
                    .foregroundStyle(Theme.brandGradient)
                Text("Frontline")
                    .font(.title2.bold())
            }
            Text("Dating for the people who show up")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 24)
        .padding(.bottom, 12)
    }

    // MARK: - Steps

    private var basicsStep: some View {
        StepScroll(title: "The basics",
                   subtitle: "This is how you'll appear to other members.") {
            LabeledField("First name") {
                TextField("e.g. Mette", text: $draft.name)
                    .textInputAutocapitalization(.words)
            }
            LabeledField("Age") {
                Stepper("\(draft.age)", value: $draft.age, in: 18...99)
            }
            LabeledField("I am a") {
                Picker("Gender", selection: $draft.gender) {
                    ForEach(Gender.allCases) { Text($0.label).tag($0) }
                }
                .pickerStyle(.segmented)
            }
            LabeledField("City") {
                TextField("e.g. København", text: $draft.city)
                    .textInputAutocapitalization(.words)
            }
        }
    }

    private var professionStep: some View {
        StepScroll(title: "Your profession",
                   subtitle: "Frontline is only for essential and care workers. Pick the one that fits you best.") {
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
        StepScroll(title: "Who you'd like to meet",
                   subtitle: "You can change this any time.") {
            LabeledField("Show me") {
                VStack(spacing: 8) {
                    ForEach(Gender.allCases) { gender in
                        SeekingRow(gender: gender,
                                   isOn: draft.seeking.contains(gender)) {
                            toggleSeeking(gender)
                        }
                    }
                }
            }
            LabeledField("About you") {
                TextField("Share something real…", text: $draft.bio, axis: .vertical)
                    .lineLimit(3...6)
            }
        }
    }

    private var verifyStep: some View {
        StepScroll(title: "Verify you belong",
                   subtitle: "Every member confirms their profession, so the community stays real. In this demo we simulate the work-ID check.") {
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
                    verifyBullet("Upload a photo of your work ID or badge")
                    verifyBullet("A reviewer confirms it within 24 hours")
                    verifyBullet("Your document is never shown on your profile")
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
                    Button("Back") { withAnimation { step -= 1 } }
                        .buttonStyle(.bordered)
                }
                Button(action: advance) {
                    Text(step == lastStep ? (verifying ? "Verifying…" : "Verify & enter") : "Continue")
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
                return "Add your first name to continue."
            }
            if draft.city.trimmingCharacters(in: .whitespaces).isEmpty {
                return "Add your city to continue."
            }
            return nil
        case 2:
            return draft.seeking.isEmpty ? "Pick at least one option for who to show." : nil
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
