import SwiftUI
import LocalAuthentication

@main
struct FrontlineApp: App {
    @StateObject private var state = AppState()
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(state)
                .tint(Theme.brand)
                .onChange(of: scenePhase) { _, phase in
                    // Re-lock whenever the app leaves the foreground.
                    if phase != .active { state.lockIfNeeded() }
                }
        }
    }
}

/// Decides what to show: the app lock, the consent gate, onboarding, or the app.
struct RootView: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        Group {
            if state.appLockEnabled && !state.isUnlocked {
                LockView()
            } else if !state.hasRequiredConsent {
                ConsentGateView()
            } else if state.isOnboarded {
                MainTabView()
            } else {
                OnboardingView()
            }
        }
        .animation(.easeInOut, value: state.isOnboarded)
        .animation(.easeInOut, value: state.hasRequiredConsent)
        .animation(.easeInOut, value: state.isUnlocked)
    }
}

/// The biometric / passcode lock screen (a security feature).
struct LockView: View {
    @EnvironmentObject private var state: AppState
    @State private var failed = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [Theme.brandDeep, .black],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 22) {
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(.white)
                Text("Frontline er låst")
                    .font(.title2.bold())
                    .foregroundStyle(.white)
                Text("Lås op for at beskytte dine beskeder og data.")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.85))
                    .multilineTextAlignment(.center)

                Button(action: authenticate) {
                    Label("Lås op", systemImage: "faceid")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.white)
                .foregroundStyle(Theme.brandDeep)
                .padding(.horizontal, 60)

                if failed {
                    Text("Kunne ikke låse op. Prøv igen.")
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.9))
                }
            }
            .padding()
        }
        .onAppear(perform: authenticate)
    }

    private func authenticate() {
        let context = LAContext()
        context.localizedFallbackTitle = "Brug kode"
        var error: NSError?
        // Biometrics if available, otherwise device passcode.
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            // No auth configured on the device — don't lock the user out.
            state.markUnlocked()
            return
        }
        context.evaluatePolicy(.deviceOwnerAuthentication,
                               localizedReason: "Lås Frontline op") { success, _ in
            DispatchQueue.main.async {
                if success { state.markUnlocked() } else { failed = true }
            }
        }
    }
}
