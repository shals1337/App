# Frontline

An exclusive iOS dating app for the people who show up — **verified frontline
and essential workers**: nurses, doctors, paramedics, police officers,
firefighters, military, teachers, social workers, and midwives. Built with
SwiftUI, no backend required (everything is stored locally on device).

> The idea: membership is gated to vetted professions, and every member
> confirms their job through a work-ID check, so the community stays real.

**The user-facing UI is in Danish**; the source code, comments, and this
README are in English.

## Features

- **Profession-gated onboarding** — pick your vetted profession, set who you'd
  like to meet, and pass a (simulated) work-ID verification step before you can
  enter the app.
- **Swipe deck** — a draggable card stack in the app's own **blue→teal** brand
  palette (deliberately not Tinder's colours — see *Compliance* below). Swipe
  **right** to like, **left** to nope, **up** to highlight — with LIKE / NEJ /
  FREMHÆV stamps. Below the deck sit round action buttons: **rewind**, **nope**,
  **highlight (Fremhæv)**, **like**. A Turbo button and a filters button sit in
  the top bar. Liking also works entirely from buttons, so swiping is not the
  only mechanic.
- **Subscription (Gratis / Premium / Elite)** — a full paywall with feature
  gates:
  - **Gratis**: 15 likes/day, 1 highlight/day, no rewind.
  - **Premium**: unlimited likes, rewind, 5 highlights/day, no distance cap.
  - **Elite**: everything in Premium + **see who likes you** + a monthly
    **Turbo**.
  - Daily quotas reset each calendar day; hitting a limit raises the paywall on
    the relevant pitch. Purchases are **simulated locally** — see below.
- **"Kan lide dig" (Likes You)** — a dedicated tab; a grid of people who
  already liked you, blurred behind an Elite upsell and tappable for an instant
  match once you're Elite.
- **Two-step verification centre** — a **selfie/photo** check and a
  **work-ID/profession** check, each via a photo upload and a simulated review,
  producing verified seals shown on your profile.
- **Discovery filters** — who to show, age range, and max distance, which
  actually filter the deck.
- **Rewind** — undo your last swipe (and any match it created), refunding the
  consumed like. A Premium/Elite feature.
- **Lively chat** — **read receipts** ("Sendt" → "Set"), an animated **typing
  indicator**, and simulated replies so conversations feel alive.
- **Polished motion** — a spring-in match celebration with code-drawn
  **confetti**, pressable action buttons, animated message bubbles, and haptic
  feedback (`.sensoryFeedback`). All animations are drawn in code — no assets.
- **Instant matches**, **matches list**, **editable profile**, and an
  *erase all data* option.
- **Persistent** — profile, matches, messages, subscription tier and daily
  quotas are saved between launches via `UserDefaults`.

## What is real vs. simulated

The app is fully usable end-to-end with **no backend**. Two things are
deliberately simulated and are the seams where a production system plugs in:

1. **Subscriptions** — `Tier`/`Entitlements` model the ladder and gate every
   feature, and `AppState.subscribe(_:)` unlocks it, but the "purchase" is a
   local timer. For release, back each tier with a **StoreKit 2** auto-renewable
   product (App Store Connect) and call `subscribe(_:)` from a verified
   `Transaction`.
2. **Verification** — the selfie and work-ID uploads flip a flag after a short
   fake review; the images are discarded, never stored or shown. For release,
   send them to an **identity/liveness + document-check provider** and set the
   flags from its verified callback.

## Compliance (GDPR) & IP

This build takes both concerns seriously — but **none of it is legal advice**,
and it must be reviewed by a lawyer before launch. See **[LEGAL.md](LEGAL.md)**
for the full checklist. In short:

- **Privacy / GDPR** — a consent gate (18+, policy/terms, and *explicit*
  special-category consent for orientation/profession), separate explicit
  **biometric consent** before the verification selfie, in-app **data export**
  (portability), **erase all data** (erasure), **withdraw consent**, versioned
  policy/terms, and local-only storage with no third-party analytics. The
  in-app policy and terms in `LegalView.swift` are **templates** with
  placeholders to fill in.
- **Not copying Tinder** — the app avoids Tinder's flame mark, its orange→pink
  trade-dress gradient, and its trademarked names ("Super Like", "Boost",
  "Gold"/"Plus", "It's a Match"), using its own palette and wording, and the
  terms state it is unaffiliated. The **swipe-UI patent** held by Match Group is
  a real, separate risk that a patent attorney must assess — swiping is kept
  optional alongside button controls, which is a mitigation, not a guarantee.

## Requirements

- Xcode 15 or later
- iOS 17.0+ (simulator or device)

## Run

1. Open `Frontline.xcodeproj` in Xcode.
2. Select the **Frontline** scheme and an iPhone simulator.
3. Press **Run** (⌘R).

## Project layout

| File | Purpose |
|------|---------|
| `FrontlineApp.swift` | App entry point + `RootView` (onboarding vs. main tabs). |
| `AppState.swift` | Observable store: user, deck, likes/passes, matches, chat, persistence. |
| `Models.swift` | `Profession`, `Gender`, `UserProfile`, `Candidate`, `Match`, `Message`, sample data. |
| `Theme.swift` | Brand colours and card gradients. |
| `OnboardingView.swift` | Multi-step sign-up with profession gating & verification. |
| `MainTabView.swift` | Discover / Matches / Profile tabs. |
| `DiscoverView.swift` | Swipe deck, action buttons, "It's a match!" overlay. |
| `CardView.swift` | Profile card, profession badge, LIKE/NOPE stamps. |
| `MatchesView.swift` | List of matches. |
| `ChatView.swift` | One-on-one conversation. |
| `ProfileView.swift` | Own profile, edit sheet, erase data. |

## Customizing

- **Allowed professions:** edit the `Profession` enum in `Models.swift`
  (label, SF Symbol, and tint colour per case).
- **Starter members:** edit `SampleData.candidates` in `Models.swift`. Set
  `likesYou: true` on a candidate to make liking them an instant match.
- **Rename / bundle id:** change the target's *Display Name* / `PRODUCT_NAME`
  and `PRODUCT_BUNDLE_IDENTIFIER` (currently `com.example.Frontline`).
- **Brand colours:** edit `Theme.swift` and the `AccentColor` asset.

## Notes & next steps

This is a front-end demo. To ship for real you'd add: a backend and real
accounts, actual photo uploads, a genuine ID-verification pipeline, moderation
and reporting, push notifications, and location services in place of the mock
distances. The "who has liked you" logic is currently simulated with the
`likesYou` flag on sample data.
