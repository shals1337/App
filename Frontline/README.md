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
- **Tinder-style swipe deck** — a draggable card stack with the warm
  orange→pink Tinder gradient. Swipe **right** to like, **left** to nope,
  **up** to super like — with LIKE / NEJ / SUPERLIKE stamps. Below the deck sit
  the classic round action buttons: **rewind**, **nope**, **super like**,
  **like**. Cards are filtered to the genders you're seeking.
- **Rewind** — undo your last swipe (and any match it created), just like
  Tinder's back button.
- **Instant matches** — like someone who already liked you (or super-like
  anyone) and get a "Det er et match!" celebration.
- **Matches & chat** — a list of your matches with a simple, persistent
  one-on-one conversation view.
- **Your profile** — a verified badge, editable details, and a
  *log ud & slet data* option that wipes all local data.
- **Persistent** — profile, matches, and messages are saved between launches
  via `UserDefaults` (JSON).

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
