import SwiftUI

/// The admin tool: manual verification review **and** moderation of reported
/// conversations. Only conversations a user has explicitly **reported** appear
/// here — there is no bulk scanning of private messages (that would breach
/// GDPR/ePrivacy). For production this would be a separate, access-controlled,
/// audit-logged back-office tool.
struct AdminView: View {
    @EnvironmentObject private var state: AppState
    @State private var tab = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("", selection: $tab) {
                    Text("Verificering (\(state.adminQueue.count))").tag(0)
                    Text("Anmeldelser (\(state.openReports.count))").tag(1)
                }
                .pickerStyle(.segmented)
                .padding()

                if tab == 0 {
                    verificationList
                } else {
                    moderationList
                }
            }
            .navigationTitle("Admin")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: Report.self) { report in
                ModerationDetailView(report: report)
            }
        }
    }

    // MARK: - Verification queue

    private var verificationList: some View {
        Group {
            let queue = state.adminQueue
            if queue.isEmpty {
                ContentUnavailableView {
                    Label("Ingen ventende verificeringer", systemImage: "checkmark.seal")
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
    }

    // MARK: - Moderation queue

    private var moderationList: some View {
        Group {
            if state.openReports.isEmpty {
                ContentUnavailableView {
                    Label("Ingen anmeldelser", systemImage: "flag")
                } description: {
                    Text("Kun samtaler, som brugere selv anmelder, vises her til gennemgang.")
                }
            } else {
                List {
                    Section {
                        ForEach(state.openReports) { report in
                            NavigationLink(value: report) {
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(report.matchName).font(.headline)
                                    Text(report.reason.label)
                                        .font(.subheadline).foregroundStyle(.secondary)
                                    Text(report.date.formatted(date: .abbreviated, time: .shortened))
                                        .font(.caption).foregroundStyle(.tertiary)
                                }
                            }
                        }
                    } footer: {
                        Text("En moderator gennemgår kun de samtaler, der er anmeldt — private beskeder scannes ikke.")
                    }
                }
            }
        }
    }
}

// MARK: - Verification card

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
                    Label("Afvis", systemImage: "xmark").frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                Button(action: approve) {
                    Label("Godkend", systemImage: "checkmark").frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Moderation detail (read-only reported conversation)

private struct ModerationDetailView: View {
    @EnvironmentObject private var state: AppState
    @Environment(\.dismiss) private var dismiss
    let report: Report

    var body: some View {
        VStack(spacing: 0) {
            if let match = state.match(for: report) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Anmeldt: \(report.reason.label)", systemImage: "flag.fill")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.orange)
                            .padding(.bottom, 4)
                        ForEach(match.messages) { message in
                            HStack {
                                if message.fromMe { Spacer(minLength: 40) }
                                Text(message.text)
                                    .padding(.horizontal, 12).padding(.vertical, 8)
                                    .background(message.fromMe ? AnyShapeStyle(Theme.brand.opacity(0.15))
                                                              : AnyShapeStyle(Color(.secondarySystemBackground)),
                                                in: RoundedRectangle(cornerRadius: 14))
                                if !message.fromMe { Spacer(minLength: 40) }
                            }
                        }
                    }
                    .padding()
                }
            } else {
                ContentUnavailableView("Samtalen er ikke tilgængelig", systemImage: "bubble.left")
            }

            HStack(spacing: 10) {
                Button(role: .cancel) {
                    state.dismissReport(report); dismiss()
                } label: {
                    Text("Afvis anmeldelse").frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button(role: .destructive) {
                    state.block(matchID: report.matchID); dismiss()
                } label: {
                    Text("Bloker & fjern").frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            }
            .padding()
            .background(.bar)
        }
        .navigationTitle("Anmeldelse")
        .navigationBarTitleDisplayMode(.inline)
    }
}
