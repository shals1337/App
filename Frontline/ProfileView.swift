import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var state: AppState
    @State private var editing = false
    @State private var showEraseAlert = false

    var body: some View {
        NavigationStack {
            Group {
                if let user = state.user {
                    List {
                        Section {
                            header(user)
                                .listRowInsets(EdgeInsets())
                                .listRowBackground(Color.clear)
                        }

                        Section("Om") {
                            Text(user.bio.isEmpty ? "Ingen bio endnu." : user.bio)
                                .foregroundStyle(user.bio.isEmpty ? .secondary : .primary)
                        }

                        Section("Detaljer") {
                            row("Erhverv", user.profession.label, symbol: user.profession.symbol, tint: user.profession.tint)
                            row("Lokation", user.city, symbol: "mappin.circle.fill")
                            row("Alder", "\(user.age)", symbol: "calendar")
                            row("Viser mig", user.seeking.map(\.label).joined(separator: ", "),
                                symbol: "heart.fill")
                        }

                        Section {
                            Button("Rediger profil") { editing = true }
                            Button("Log ud & slet data", role: .destructive) {
                                showEraseAlert = true
                            }
                        }
                    }
                }
            }
            .navigationTitle("Profil")
            .sheet(isPresented: $editing) {
                if let user = state.user {
                    EditProfileView(profile: user) { state.updateProfile($0) }
                }
            }
            .alert("Slet alt?", isPresented: $showEraseAlert) {
                Button("Slet", role: .destructive) { state.signOutAndErase() }
                Button("Annuller", role: .cancel) {}
            } message: {
                Text("Din profil, dine matches og beskeder slettes permanent fra denne enhed.")
            }
        }
    }

    private func header(_ user: UserProfile) -> some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(user.profession.tint.gradient)
                    .frame(width: 110, height: 110)
                Text(initials(user.name))
                    .font(.system(size: 40, weight: .bold))
                    .foregroundStyle(.white)
            }
            HStack(spacing: 6) {
                Text("\(user.name), \(user.age)").font(.title2.bold())
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(user.profession.tint)
            }
            ProfessionBadge(profession: user.profession)
            Label("Verificeret frontline-medlem", systemImage: "checkmark.shield.fill")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
    }

    private func row(_ title: String, _ value: String, symbol: String, tint: Color = .secondary) -> some View {
        HStack {
            Label(title, systemImage: symbol)
                .foregroundStyle(tint == .secondary ? Color.primary : tint)
            Spacer()
            Text(value)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.trailing)
        }
    }

    private func initials(_ name: String) -> String {
        let parts = name.split(separator: " ")
        let letters = parts.prefix(2).compactMap { $0.first }
        return letters.isEmpty ? "?" : String(letters).uppercased()
    }
}

/// Edit sheet reusing the same fields as onboarding (minus verification).
private struct EditProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @State var profile: UserProfile
    let onSave: (UserProfile) -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("Det basale") {
                    TextField("Fornavn", text: $profile.name)
                    Stepper("Alder: \(profile.age)", value: $profile.age, in: 18...99)
                    Picker("Jeg er", selection: $profile.gender) {
                        ForEach(Gender.allCases) { Text($0.label).tag($0) }
                    }
                    TextField("By", text: $profile.city)
                }

                Section("Erhverv") {
                    Picker("Erhverv", selection: $profile.profession) {
                        ForEach(Profession.allCases) { Label($0.label, systemImage: $0.symbol).tag($0) }
                    }
                }

                Section("Vis mig") {
                    ForEach(Gender.allCases) { gender in
                        Toggle(gender.label, isOn: binding(for: gender))
                    }
                }

                Section("Om dig") {
                    TextField("Del noget ægte…", text: $profile.bio, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("Rediger profil")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuller") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Gem") {
                        onSave(sanitized)
                        dismiss()
                    }
                    .disabled(!isValid)
                }
            }
        }
    }

    private var sanitized: UserProfile {
        var copy = profile
        copy.name = copy.name.trimmingCharacters(in: .whitespaces)
        copy.city = copy.city.trimmingCharacters(in: .whitespaces)
        if copy.seeking.isEmpty { copy.seeking = [.woman, .man, .nonbinary] }
        return copy
    }

    private var isValid: Bool {
        !profile.name.trimmingCharacters(in: .whitespaces).isEmpty
        && !profile.city.trimmingCharacters(in: .whitespaces).isEmpty
        && !profile.seeking.isEmpty
    }

    private func binding(for gender: Gender) -> Binding<Bool> {
        Binding(
            get: { profile.seeking.contains(gender) },
            set: { isOn in
                if isOn {
                    if !profile.seeking.contains(gender) { profile.seeking.append(gender) }
                } else {
                    profile.seeking.removeAll { $0 == gender }
                }
            }
        )
    }
}
