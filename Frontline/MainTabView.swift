import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        TabView {
            DiscoverView()
                .tabItem { Label("Udforsk", systemImage: "flame.fill") }

            MatchesView()
                .tabItem { Label("Matches", systemImage: "bubble.left.and.bubble.right.fill") }
                .badge(state.matches.count)

            ProfileView()
                .tabItem { Label("Profil", systemImage: "person.crop.circle.fill") }
        }
    }
}
