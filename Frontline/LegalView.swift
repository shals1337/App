import SwiftUI

/// Current legal document versions. Bump these when the text changes so members
/// are asked to re-consent.
enum LegalDocs {
    static let policyVersion = "1.0"
    static let termsVersion = "1.0"
    static let controller = "[Selskabsnavn ApS, CVR [nr.], [adresse]]"
    static let contact = "privacy@[ditdomæne].dk"

    static let privacy = """
    PRIVATLIVSPOLITIK (skabelon — skal gennemgås af en jurist)

    Version \(policyVersion)

    1. Dataansvarlig
    \(controller) er dataansvarlig for behandlingen af dine personoplysninger. \
    Kontakt: \(contact).

    2. Hvilke oplysninger vi behandler
    • Profil: fornavn, alder, køn, by, bio og erhverv.
    • Præferencer: hvem du vil møde (køn), alders- og afstandsfiltre.
    • Aktivitet: dine likes, fravalg, matches og beskeder.
    • Abonnement: dit valgte niveau (ingen kortoplysninger — betaling håndteres \
      af App Store).
    • Verificering: et selfie og et arbejds-ID/dokument, der bruges til at \
      bekræfte dig. Billederne behandles kun til verificering og gemmes ikke i \
      appen.

    3. Særlige kategorier (GDPR art. 9)
    Oplysning om, hvilket køn du søger, kan afsløre din seksuelle orientering, og \
    et selfie kan udgøre biometriske data. Vi behandler kun disse på grundlag af \
    dit UDTRYKKELIGE samtykke, som du giver særskilt og til enhver tid kan \
    trække tilbage.

    4. Formål og retsgrundlag
    • At levere tjenesten (matchning, chat): nødvendigt for aftalen, art. 6(1)(b).
    • Særlige kategorier og verificering: udtrykkeligt samtykke, art. 9(2)(a).
    • Sikkerhed og misbrugsforebyggelse: legitim interesse, art. 6(1)(f).

    5. Opbevaring
    Oplysningerne opbevares, så længe din konto er aktiv. I denne udgave ligger \
    alt lokalt på din enhed og slettes, når du sletter din konto.

    6. Dine rettigheder
    Du har ret til indsigt, berigtigelse, sletning, begrænsning, dataportabilitet \
    og til at trække samtykke tilbage. Brug "Eksportér mine data" og "Slet konto" \
    i appen, eller kontakt os. Du kan klage til Datatilsynet.

    7. Deling
    I en rigtig udgivelse deles data med databehandlere (hosting, \
    identitetsverificering). Der indgås databehandleraftaler, og overførsler \
    uden for EU/EØS sker kun med gyldigt overførselsgrundlag.

    8. Alder
    Tjenesten er kun for personer på 18 år og derover.

    9. Geografi og lovvalg
    Tjenesten udbydes kun i Danmark. Behandlingen er underlagt databeskyttelses-\
    forordningen (GDPR) og dansk databeskyttelseslovgivning, og du kan klage til \
    Datatilsynet (datatilsynet.dk).

    Dette er en SKABELON og udgør ikke juridisk rådgivning.
    """

    static let terms = """
    HANDELSBETINGELSER (skabelon — skal gennemgås af en jurist)

    Version \(termsVersion)

    1. Om tjenesten
    Frontline er en datingtjeneste for verificerede fagpersoner i udvalgte \
    erhverv. Du skal være mindst 18 år. Tjenesten udbydes kun i Danmark og er \
    rettet mod personer bosat i Danmark.

    2. Din adfærd
    Du indestår for, at dine oplysninger er korrekte, og at du kun opretter én \
    konto til dig selv. Chikane, ulovligt indhold og misbrug er forbudt og kan \
    føre til udelukkelse.

    3. Abonnement
    Betalte abonnementer (Premium, Elite) håndteres af App Store. I denne \
    demoudgave gennemføres ingen reel betaling.

    4. Verificering
    Verificering hjælper med at holde fællesskabet ægte, men er ingen garanti \
    for en anden persons identitet eller hensigter. Mød altid trygt.

    5. Ansvarsfraskrivelse
    Tjenesten leveres "som den er". I det omfang loven tillader det, fraskriver \
    vi os ansvar for indirekte tab.

    6. Uafhængighed
    Frontline er ikke tilknyttet, sponsoreret af eller forbundet med Tinder, \
    Match Group eller andre datingtjenester.

    7. Lovvalg og værneting
    Disse betingelser er underlagt dansk ret. Tvister afgøres ved de danske \
    domstole. Dine ufravigelige rettigheder som forbruger berøres ikke.

    Dette er en SKABELON og udgør ikke juridisk rådgivning.
    """
}

/// The consent gate shown before onboarding. Nothing is collected until the
/// member has confirmed their age and given the required consents.
struct ConsentGateView: View {
    @EnvironmentObject private var state: AppState

    @State private var over18 = false
    @State private var acceptTerms = false
    @State private var acceptSpecial = false
    @State private var showPolicy = false
    @State private var showTerms = false

    private var canContinue: Bool { over18 && acceptTerms && acceptSpecial }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    header

                    ConsentRow(isOn: $over18,
                               text: "Jeg er mindst 18 år gammel.")
                    ConsentRow(isOn: $acceptTerms) {
                        Text("Jeg accepterer ")
                        + Text("handelsbetingelserne").underline()
                        + Text(" og har læst ")
                        + Text("privatlivspolitikken").underline()
                        + Text(".")
                    }
                    ConsentRow(isOn: $acceptSpecial,
                               text: "Jeg giver udtrykkeligt samtykke til, at Frontline må behandle mit erhverv og hvem jeg søger (særlige kategorier, GDPR art. 9) for at kunne vise mig relevante profiler.")

                    HStack(spacing: 16) {
                        Button("Læs privatlivspolitik") { showPolicy = true }
                        Button("Læs betingelser") { showTerms = true }
                    }
                    .font(.footnote)

                    Text("Du kan til enhver tid trække dit samtykke tilbage, eksportere eller slette dine data i appen.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
            }
            .safeAreaInset(edge: .bottom) {
                Button {
                    state.recordConsent(over18: over18, specialCategory: acceptSpecial)
                } label: {
                    Text("Fortsæt")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(!canContinue)
                .padding()
                .background(.bar)
            }
            .navigationTitle("Velkommen")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showPolicy) {
                LegalTextView(title: "Privatlivspolitik", text: LegalDocs.privacy)
            }
            .sheet(isPresented: $showTerms) {
                LegalTextView(title: "Betingelser", text: LegalDocs.terms)
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "checkmark.shield.fill")
                    .foregroundStyle(Theme.brandGradient)
                Text("Frontline").font(.title.bold())
            }
            Text("Før du starter, har vi brug for dit samtykke. Vi indsamler kun det nødvendige, og du bestemmer over dine data.")
                .foregroundStyle(.secondary)
        }
    }
}

private struct ConsentRow<Content: View>: View {
    @Binding var isOn: Bool
    let content: Content

    init(isOn: Binding<Bool>, @ViewBuilder content: () -> Content) {
        _isOn = isOn
        self.content = content()
    }
    init(isOn: Binding<Bool>, text: String) where Content == Text {
        _isOn = isOn
        self.content = Text(text)
    }

    var body: some View {
        Button { isOn.toggle() } label: {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: isOn ? "checkmark.square.fill" : "square")
                    .font(.title3)
                    .foregroundStyle(isOn ? Theme.brand : Color.secondary)
                content
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
        }
        .buttonStyle(.plain)
    }
}

/// A plain scrollable reader for a legal document.
struct LegalTextView: View {
    @Environment(\.dismiss) private var dismiss
    let title: String
    let text: String

    var body: some View {
        NavigationStack {
            ScrollView {
                Text(text)
                    .font(.callout)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Luk") { dismiss() }
                }
            }
        }
    }
}
