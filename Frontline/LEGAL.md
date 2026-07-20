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

- **The swipe patent.** Match Group holds patents on the swipe-card matching UI
  (e.g. US 9,733,811) and has litigated them (notably against Bumble). Frontline
  keeps a swipe interaction **but also offers full button-based** like / nope /
  highlight, so swiping is not the only mechanic. This does **not** guarantee
  non-infringement. Options to de-risk: get a freedom-to-operate opinion; make
  the card/button UI the default and swipe optional or off; or design around the
  specific claims. **Talk to a patent attorney.**
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
