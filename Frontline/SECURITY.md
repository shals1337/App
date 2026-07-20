# Frontline — Security notes

**Straight answer: no app can be "100% secure."** Anyone who promises that is
wrong. What you *can* do is reduce risk with layered, well-reviewed security and
be honest about the limits. This document is engineering guidance, **not** a
security certification, and a real launch needs an independent security review
and penetration test.

## What this build does today

- **App lock** — optional Face ID / Touch ID / passcode gate on every launch
  and whenever the app returns from the background (`LocalAuthentication`).
- **No password stored on-device** — onboarding collects a password to *create*
  an account, but it is never written to disk here; in production it goes
  straight to a secure auth provider and is never stored in plaintext anywhere.
- **Verification images are not stored** — the selfie and work-ID are used for
  the (manual) review and then discarded; they are never saved or shown on a
  profile.
- **Manual verification review** — an administrator approves each work-ID /
  selfie; nothing self-approves, which reduces fake/impersonation accounts.
- **Data minimisation & locality** — data lives on-device only, no backend and
  no third-party analytics/trackers, so there is no server to breach in the demo.
- **Full erase** — the member can delete all local data at any time.

## What a real, secure launch still requires

This is a **local demo with no backend**, so most production security controls
are out of scope here and must be built for release:

- **Transport security** — all traffic over TLS 1.2+/HSTS; certificate pinning
  for the app's API.
- **Authentication** — a vetted identity provider (e.g. Sign in with Apple /
  OAuth), passwords hashed with a strong KDF (argon2/bcrypt) **server-side**,
  MFA, rate limiting and lockout.
- **Encryption at rest** — secrets in the iOS Keychain; sensitive server data
  encrypted; verification media in encrypted, access-controlled storage with
  short retention and audit logs.
- **Verification pipeline** — a real identity/liveness + document-check
  provider; the admin tool access-controlled (RBAC), MFA-protected and logged.
- **Authorization** — server-side checks so a client can never read another
  user's messages or data; the "admin mode" here is a client-side demo only.
- **Abuse & safety** — block/report, moderation, anti-spam, and detection of
  fake accounts.
- **Privacy** — DPIA, data-processing agreements, retention limits, and the
  GDPR rights already surfaced in-app (export, erase, withdraw consent).
- **Assurance** — dependency scanning, secrets management, an independent
  penetration test and a coordinated vulnerability-disclosure process.

## Reporting

For a real deployment, publish a security contact / `security.txt` and a
responsible-disclosure policy so researchers can report issues safely.
