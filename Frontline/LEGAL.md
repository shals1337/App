# Frontline — Legal & compliance notes

**This is engineering scaffolding, not legal advice.** Have a qualified lawyer
review everything below before you launch, collect real user data, or take
payment. The in-app privacy policy and terms (`LegalView.swift`) are **templates**
with placeholders (`[Selskabsnavn ApS, CVR …]`, contact email) you must fill in.

## 1. Avoiding conflict with Tinder / Match Group

Tinder and its parent Match Group hold trademarks and patents. This project was
deliberately built to steer clear of the most common problems. What we changed
and why:

| Risk area | What Tinder claims | What Frontline does |
|-----------|--------------------|---------------------|
| **Brand colour / trade dress** | The orange→pink flame gradient | Uses a distinct **blue→teal** palette; no flame gradient |
| **Flame logo** | Tinder's flame mark | Uses a **shield/verified** mark instead |
| **"Super Like"** (trademark) | Blue star priority like | Renamed to **"Fremhæv"** (highlight); different icon & colour |
| **"Boost"** (trademark) | Visibility boost | Renamed to **"Turbo"** |
| **"Tinder Gold" / "Tinder Plus"** (trademarks) | Tier names | Renamed to **"Premium"** / **"Elite"** |
| **"It's a Match!"** (trademark) | Match celebration copy | Changed to **"I har matchet!"** |
| Association | — | Terms state Frontline is **not affiliated with Tinder/Match Group** |

### Copyright — original assets only

Copyright protects *creative expression* (code, images, text, sounds). Frontline
is built to avoid copying anyone's:

- **No third-party images or fonts.** There are no photos, no bundled artwork
  and no licensed fonts. Profile "photos" are code-drawn gradients with a
  monogram; icons are **SF Symbols**, which Apple licenses for use in app UI
  (not as your own logo/trademark). The confetti and typing animations are
  drawn in code.
- **Original text.** All copy, sample names, bios and the policy/terms drafts
  were written for this project — none is copied from Tinder or any other app.
- **Original colours and layout.** The palette, gradients and screen layouts
  are our own, not traced from another product.

If you later add real photos, fonts, sounds, or copy, make sure you own them or
have a licence, and keep records.

### Still your responsibility

- **The swipe patent — why competitors can and how to handle it.** Match Group
  holds patents on the swipe-card matching UI (e.g. US 9,733,811). Why do others
  swipe? **Tinder** is Match Group, so it owns them. **Badoo/Bumble** were sued
  by Match Group (2018) and **settled/cross-licensed** (2020) — they didn't get
  it for free. A new app has neither, so treat this as a real risk **in the US**.

  Two things make it manageable:
  1. **Jurisdiction.** These are **US** patents. The EU generally does **not**
     grant/enforce pure software-UI method patents ("programs for computers …
     as such" and "presentations of information" are excluded, EPC Art. 52), and
     Match Group's swipe patents have been challenged. So for a **Denmark/EU**
     launch the risk is substantially lower than in the US.
  2. **Choice, not lock-in.** Frontline offers a full **button-based** mode
     (like / nope / highlight) alongside swipe, so you can ship buttons-only in
     higher-risk markets without redesigning.

  Swipe is enabled by default (as users expect). Before a **US** launch, get a
  **freedom-to-operate opinion** from a patent attorney, or consider licensing
  or shipping buttons-only there. For EU-only, still have a lawyer confirm.
- **The name "Frontline".** Common word, but run a trademark clearance search in
  your markets (and the App Store) before committing to it.
- **App Store rules.** Apple requires a privacy policy, working account
  deletion, and (for dating apps) often age-gating and safety information.

## 2. GDPR / privacy — what's implemented

- **Consent gate** before any data is entered (`ConsentGateView`): 18+
  confirmation, accept policy + terms, and **explicit** consent for
  special-category data (Art. 9 — "seeking" gender can reveal sexual
  orientation; profession).
- **Explicit biometric consent** before the verification selfie
  (`VerificationView`). The image is discarded, never stored or shown.
- **Data-subject rights** in Profile → *Privatliv & data*:
  - **Access / portability** — "Eksportér mine data" writes a JSON export.
  - **Erasure** — "Log ud & slet data" wipes everything locally.
  - **Withdraw consent** — removes special-category consent and returns the
    member to the consent gate.
- **Data minimisation & locality** — everything is stored locally in
  `UserDefaults`; there is no backend and no third-party analytics.
- **Versioned documents** — bump `LegalDocs.policyVersion` / `termsVersion` to
  force re-consent when the text changes.

### Before launch you still need

- A **real data controller**, a filled-in policy, and a lawful-basis review.
- **Data processing agreements** with any processor you add (hosting, the
  identity-verification provider, push, analytics).
- A defined **retention schedule** and deletion pipeline on the server side.
- **Age assurance** stronger than a checkbox if your risk assessment requires it.
- A **DPIA** (data protection impact assessment) — dating + special-category +
  biometric processing very likely requires one.
- A route to **exercise rights** and to **contact the DPA** (Datatilsynet in DK).
