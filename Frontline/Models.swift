import SwiftUI

// MARK: - Gender

/// Genders a member can identify as and filter for.
enum Gender: String, Codable, CaseIterable, Identifiable {
    case woman
    case man
    case nonbinary

    var id: String { rawValue }

    var label: String {
        switch self {
        case .woman: return "Woman"
        case .man: return "Man"
        case .nonbinary: return "Non-binary"
        }
    }
}

// MARK: - Profession

/// The vetted, "frontline" professions the app is exclusive to.
///
/// Frontline is not an open dating app: to join you must belong to one of
/// these essential-worker groups. The `open` case is reserved for members
/// who want to date across every profession (their own is still verified).
enum Profession: String, Codable, CaseIterable, Identifiable {
    case nurse
    case doctor
    case paramedic
    case police
    case firefighter
    case military
    case teacher
    case socialWorker
    case midwife

    var id: String { rawValue }

    var label: String {
        switch self {
        case .nurse: return "Nurse"
        case .doctor: return "Doctor"
        case .paramedic: return "Paramedic"
        case .police: return "Police officer"
        case .firefighter: return "Firefighter"
        case .military: return "Military"
        case .teacher: return "Teacher"
        case .socialWorker: return "Social worker"
        case .midwife: return "Midwife"
        }
    }

    /// SF Symbol used as the profession badge throughout the app.
    var symbol: String {
        switch self {
        case .nurse: return "cross.case.fill"
        case .doctor: return "stethoscope"
        case .paramedic: return "cross.vial.fill"
        case .police: return "shield.lefthalf.filled"
        case .firefighter: return "flame.fill"
        case .military: return "medal.fill"
        case .teacher: return "graduationcap.fill"
        case .socialWorker: return "hands.and.sparkles.fill"
        case .midwife: return "figure.and.child.holdinghands"
        }
    }

    /// Accent colour for the profession badge.
    var tint: Color {
        switch self {
        case .nurse: return Color(red: 0.12, green: 0.55, blue: 0.95)
        case .doctor: return Color(red: 0.00, green: 0.62, blue: 0.60)
        case .paramedic: return Color(red: 0.90, green: 0.25, blue: 0.35)
        case .police: return Color(red: 0.20, green: 0.30, blue: 0.65)
        case .firefighter: return Color(red: 0.95, green: 0.45, blue: 0.10)
        case .military: return Color(red: 0.35, green: 0.45, blue: 0.25)
        case .teacher: return Color(red: 0.55, green: 0.35, blue: 0.75)
        case .socialWorker: return Color(red: 0.85, green: 0.35, blue: 0.55)
        case .midwife: return Color(red: 0.95, green: 0.55, blue: 0.65)
        }
    }
}

// MARK: - User profile

/// The signed-in member's own profile.
struct UserProfile: Codable, Equatable {
    var name: String
    var age: Int
    var gender: Gender
    var profession: Profession
    var city: String
    var bio: String
    /// Genders this member wants to be shown.
    var seeking: [Gender]
    /// Set once the member passes the (mock) work-ID verification step.
    var isVerified: Bool

    static let empty = UserProfile(
        name: "",
        age: 27,
        gender: .woman,
        profession: .nurse,
        city: "",
        bio: "",
        seeking: [.man],
        isVerified: false
    )
}

// MARK: - Candidate

/// Another member shown in the discover deck.
struct Candidate: Identifiable, Codable, Equatable {
    let id: UUID
    var name: String
    var age: Int
    var gender: Gender
    var profession: Profession
    var city: String
    var distanceKm: Int
    var bio: String
    /// Whether this candidate has already liked the member — a like back
    /// creates an instant match.
    var likesYou: Bool
    /// Two hex-ish RGB seeds used to draw the card's gradient "photo".
    var gradientSeed: Int

    init(
        id: UUID = UUID(),
        name: String,
        age: Int,
        gender: Gender,
        profession: Profession,
        city: String,
        distanceKm: Int,
        bio: String,
        likesYou: Bool,
        gradientSeed: Int
    ) {
        self.id = id
        self.name = name
        self.age = age
        self.gender = gender
        self.profession = profession
        self.city = city
        self.distanceKm = distanceKm
        self.bio = bio
        self.likesYou = likesYou
        self.gradientSeed = gradientSeed
    }
}

// MARK: - Chat

struct Message: Identifiable, Codable, Equatable {
    let id: UUID
    var text: String
    var fromMe: Bool
    var date: Date

    init(id: UUID = UUID(), text: String, fromMe: Bool, date: Date = Date()) {
        self.id = id
        self.text = text
        self.fromMe = fromMe
        self.date = date
    }
}

struct Match: Identifiable, Codable, Equatable {
    let id: UUID
    var candidate: Candidate
    var matchedAt: Date
    var messages: [Message]

    init(candidate: Candidate, matchedAt: Date = Date(), messages: [Message] = []) {
        self.id = candidate.id
        self.candidate = candidate
        self.matchedAt = matchedAt
        self.messages = messages
    }
}

// MARK: - Sample data

enum SampleData {
    /// Starter deck of verified frontline members.
    static let candidates: [Candidate] = [
        Candidate(name: "Mette", age: 29, gender: .woman, profession: .nurse,
                  city: "København", distanceKm: 3,
                  bio: "ICU nurse on nights. Coffee snob, sea-swimmer, terrible at board games but competitive anyway.",
                  likesYou: true, gradientSeed: 1),
        Candidate(name: "Jonas", age: 33, gender: .man, profession: .firefighter,
                  city: "Aarhus", distanceKm: 8,
                  bio: "Firefighter and part-time carpenter. Dog dad to a very dramatic labrador.",
                  likesYou: false, gradientSeed: 2),
        Candidate(name: "Sofie", age: 31, gender: .woman, profession: .police,
                  city: "Odense", distanceKm: 12,
                  bio: "Patrol officer who unwinds with long runs and true-crime podcasts (I know, I know).",
                  likesYou: true, gradientSeed: 3),
        Candidate(name: "Anders", age: 36, gender: .man, profession: .doctor,
                  city: "København", distanceKm: 5,
                  bio: "ER doctor. Looking for someone who gets the odd hours and loves a spontaneous road trip.",
                  likesYou: false, gradientSeed: 4),
        Candidate(name: "Laura", age: 27, gender: .woman, profession: .paramedic,
                  city: "Aalborg", distanceKm: 21,
                  bio: "Paramedic, climber, plant hoarder. I make an excellent negroni.",
                  likesYou: true, gradientSeed: 5),
        Candidate(name: "Emil", age: 30, gender: .man, profession: .teacher,
                  city: "København", distanceKm: 4,
                  bio: "5th-grade teacher. Big on live music, bad puns, and Sunday cinnamon rolls.",
                  likesYou: false, gradientSeed: 6),
        Candidate(name: "Freja", age: 34, gender: .woman, profession: .midwife,
                  city: "Roskilde", distanceKm: 30,
                  bio: "Midwife. Calm under pressure, chaotic in the kitchen. Let's go for a walk.",
                  likesYou: true, gradientSeed: 7),
        Candidate(name: "Kasper", age: 32, gender: .man, profession: .military,
                  city: "Fredericia", distanceKm: 45,
                  bio: "Army logistics. Home cook, hiker, always up for a new trail or a good pizza.",
                  likesYou: false, gradientSeed: 8),
        Candidate(name: "Ida", age: 28, gender: .woman, profession: .socialWorker,
                  city: "København", distanceKm: 6,
                  bio: "Social worker with a soft spot for pottery and ridiculously long brunches.",
                  likesYou: true, gradientSeed: 9),
        Candidate(name: "Noah", age: 35, gender: .man, profession: .paramedic,
                  city: "Aarhus", distanceKm: 9,
                  bio: "Paramedic and weekend cyclist. Ask me about the best coffee stops in Jutland.",
                  likesYou: false, gradientSeed: 10),
    ]
}
