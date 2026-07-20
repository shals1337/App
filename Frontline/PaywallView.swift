import SwiftUI

/// The subscription screen. Purchases are simulated locally — see the note on
/// `Tier` for how to wire this to StoreKit 2 for a real release.
struct PaywallView: View {
    @EnvironmentObject private var state: AppState
    @Environment(\.dismiss) private var dismiss

    let reason: PaywallReason
    @State private var selected: Tier = .gold
    @State private var purchasing = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 22) {
                    hero
                    plans
                    perksTable
                    disclaimer
                }
                .padding()
            }
            .safeAreaInset(edge: .bottom) { buyBar }
            .navigationTitle("Opgrader")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Luk") { dismiss() }
                }
            }
        }
    }

    private var hero: some View {
        VStack(spacing: 10) {
            Image(systemName: "flame.fill")
                .font(.system(size: 44))
                .foregroundStyle(Theme.brandGradient)
            Text(reason.headline)
                .font(.title2.bold())
                .multilineTextAlignment(.center)
            Text("Vælg et abonnement og få mere ud af Frontline.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 8)
    }

    private var plans: some View {
        VStack(spacing: 12) {
            ForEach([Tier.plus, Tier.gold]) { tier in
                PlanCard(tier: tier, selected: selected == tier)
                    .onTapGesture { selected = tier }
            }
        }
    }

    private var perksTable: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Det får du med \(selected.shortLabel)")
                .font(.headline)
            ForEach(selected.perks, id: \.self) { perk in
                Label(perk, systemImage: "checkmark.circle.fill")
                    .foregroundStyle(.primary)
                    .font(.subheadline)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16))
    }

    private var disclaimer: some View {
        Text("Demo: intet bliver trukket. I en rigtig udgivelse håndteres betaling og fornyelse af App Store via StoreKit.")
            .font(.caption)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
    }

    private var buyBar: some View {
        VStack(spacing: 6) {
            Button(action: purchase) {
                Text(purchasing ? "Behandler…" : "Få \(selected.shortLabel) · \(selected.priceLabel)")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .disabled(purchasing)

            if state.tier != .free {
                Text("Nuværende abonnement: \(state.tier.label)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(.bar)
    }

    private func purchase() {
        purchasing = true
        // Simulate the App Store purchase round-trip.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
            state.subscribe(to: selected)
            purchasing = false
            dismiss()
        }
    }
}

private struct PlanCard: View {
    let tier: Tier
    let selected: Bool

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: tier == .gold ? "crown.fill" : "bolt.fill")
                .font(.title3)
                .foregroundStyle(tier.accent)
                .frame(width: 34)
            VStack(alignment: .leading, spacing: 3) {
                Text(tier.label).font(.headline)
                Text(tier.tagline)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(tier.priceLabel)
                .font(.subheadline.weight(.semibold))
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(selected ? tier.accent : Color(.separator),
                              lineWidth: selected ? 2 : 1)
        )
    }
}
