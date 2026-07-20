import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var state: AppState
    @State private var editing = false
    @State private var showEraseAlert = false
    @State private var showVerification = false
    @State private var showFilters = false
    @State private var paywall: PaywallReason?
    @State private var showPolicy = false
    @State private var showTerms = false
    @State private var exportURL: URL?

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

                        subscriptionSection
                        verificationSection(user)
                        privacySection

                        Section("Om") {
                            Text(user.bio.isEmpty ? "Ingen bio endnu." : user.bio)
                                .foregroundStyle(user.bio.isEmpty ? .secondary : .primary)
                        }

                        if !user.interests.isEmpty {
                            Section("Interesser") {
                                LazyVGrid(columns: [GridItem(.adaptive(minimum: 92), spacing: 8)],
                                          alignment: .leading, spacing: 8) {
                                    ForEach(user.interests, id: \.self) { interest in
                                        InterestChip(text: interest, onDark: false)
                                    }
                                }
                                .padding(.vertical, 4)
                            }
                        }

                        Section("Detaljer") {
                            row("Erhverv", user.profession.label, symbol: user.profession.symbol, tint: user.profession.tint)
                            row("Søger", user.lookingFor.label, symbol: user.lookingFor.symbol)
                            row("Lokation", user.city, symbol: "mappin.circle.fill")
                            row("Alder", "\(user.age)", symbol: "calendar")
                            row("Viser mig", user.seeking.map(\.label).joined(separator: ", "),
                                symbol: "heart.fill")
                            if !user.email.isEmpty {
                                row("E-mail", user.email, symbol: "envelope.fill")
                            }
                        }

                        Section {
                            Button("Rediger profil") { editing = true }
                            Button {
                                showFilters = true
                            } label: {
                                Label("Filtre for opdagelse", systemImage: "slider.horizontal.3")
                            }
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
            .sheet(isPresented: $showVerification) { VerificationView() }
            .sheet(isPresented: $showPolicy) {
                LegalTextView(title: "Privatlivspolitik", text: LegalDocs.privacy)
            }
            .sheet(isPresented: $showTerms) {
                LegalTextView(title: "Betingelser", text: LegalDocs.terms)
            }
            .sheet(isPresented: $showFilters) {
                if let user = state.user { FiltersView(profile: user) }
            }
            .sheet(item: $paywall) { PaywallView(reason: $0) }
            .alert("Slet alt?", isPresented: $showEraseAlert) {
                Button("Slet", role: .destructive) { state.signOutAndErase() }
                Button("Annuller", role: .cancel) {}
            } message: {
                Text("Din profil, dine matches og beskeder slettes permanent fra denne enhed.")
            }
        }
    }

    // MARK: - Subscription

    private var subscriptionSection: some View {
        Section("Abonnement") {
            HStack {
                Image(systemName: state.tier == .gold ? "crown.fill" : (state.tier == .plus ? "bolt.fill" : "person.fill"))
                    .foregroundStyle(state.tier.accent)
                VStack(alignment: .leading, spacing: 2) {
                    Text(state.tier.label).font(.headline)
                    Text(state.tier.tagline)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Button {
                paywall = .general
            } label: {
                Label(state.tier == .free ? "Opgrader" : "Skift abonnement",
                      systemImage: "sparkles")
            }
            if state.entitlements.boostsPerMonth > 0 {
                Button {
                    state.activateBoost()
                } label: {
                    Label(state.isBoosted ? "Turbo aktivt" : "Aktivér Turbo (30 min.)",
                          systemImage: "arrow.up.circle.fill")
                        .foregroundStyle(state.isBoosted ? Color.secondary : Tier.gold.accent)
                }
                .disabled(state.isBoosted)
            }
        }
    }

    // MARK: - Privacy & data (GDPR)

    private var privacySection: some View {
        Section("Privatliv & data") {
            Button { showPolicy = true } label: {
                Label("Privatlivspolitik", systemImage: "hand.raised.fill")
            }
            Button { showTerms = true } label: {
                Label("Handelsbetingelser", systemImage: "doc.text.fill")
            }
            if let url = exportURL {
                ShareLink(item: url) {
                    Label("Del min data-fil", systemImage: "square.and.arrow.up")
                }
            } else {
                Button {
                    exportURL = state.exportData()
                } label: {
                    Label("Eksportér mine data", systemImage: "arrow.down.doc.fill")
                }
            }
            if state.consent.specialCategory {
                Button(role: .destructive) {
                    state.withdrawSpecialConsent()
                } label: {
                    Label("Træk samtykke tilbage", systemImage: "xmark.shield.fill")
                }
            }
        }
    }

    // MARK: - Verification

    private func verificationSection(_ user: UserProfile) -> some View {
        Section("Verificering") {
            verifyRow("Erhverv", done: user.isVerified)
            verifyRow("Foto", done: user.photoVerified)
            Button {
                showVerification = true
            } label: {
                Label(user.isFullyVerified ? "Se verificering" : "Bekræft din identitet",
                      systemImage: "checkmark.shield.fill")
            }
        }
    }

    private func verifyRow(_ title: String, done: Bool) -> some View {
        HStack {
            Label(title, systemImage: done ? "checkmark.seal.fill" : "seal")
                .foregroundStyle(done ? Color.green : .primary)
            Spacer()
            Text(done ? "Verificeret" : "Mangler")
                .font(.subheadline)
                .foregroundStyle(done ? Color.green : .secondary)
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
                if user.isFullyVerified {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(Theme.superLike)
                }
            }
            ProfessionBadge(profession: user.profession)
            if state.tier != .free {
                Label(state.tier.label, systemImage: state.tier == .gold ? "crown.fill" : "bolt.fill")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(state.tier.accent)
            }
            Label(user.isFullyVerified ? "Fuldt verificeret frontline-medlem"
                                       : "Verificering ikke færdig",
                  systemImage: user.isFullyVerified ? "checkmark.shield.fill" : "shield.lefthalf.filled")
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

                Section("Jeg søger") {
                    Picker("Jeg søger", selection: $profile.lookingFor) {
                        ForEach(LookingFor.allCases) { intent in
                            Label(intent.label, systemImage: intent.symbol).tag(intent)
                        }
                    }
                }

                Section {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 104), spacing: 10)],
                              spacing: 10, alignment: .leading) {
                        ForEach(InterestCatalog.all, id: \.self) { interest in
                            InterestToggle(text: interest,
                                           selected: profile.interests.contains(interest)) {
                                toggleInterest(interest)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                } header: {
                    Text("Interesser")
                } footer: {
                    Text("Vælg op til 8. Valgt: \(profile.interests.count)")
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

    private func toggleInterest(_ interest: String) {
        if let idx = profile.interests.firstIndex(of: interest) {
            profile.interests.remove(at: idx)
        } else if profile.interests.count < 8 {
            profile.interests.append(interest)
        }
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
