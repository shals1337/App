import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        TabView {
            DiscoverView()
                .tabItem { Label("Udforsk", systemImage: "flame.fill") }

            LikesYouView()
                .tabItem { Label("Kan lide dig", systemImage: "star.fill") }
                .badge(state.likesYouCandidates.count)

            MatchesView()
                .tabItem { Label("Matches", systemImage: "bubble.left.and.bubble.right.fill") }
                .badge(state.matches.count)

            ProfileView()
                .tabItem { Label("Profil", systemImage: "person.crop.circle.fill") }
        }
    }
}
