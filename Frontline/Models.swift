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
        case .woman: return "Kvinde"
        case .man: return "Mand"
        case .nonbinary: return "Non-binær"
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
        case .nurse: return "Sygeplejerske"
        case .doctor: return "Læge"
        case .paramedic: return "Ambulanceredder"
        case .police: return "Politibetjent"
        case .firefighter: return "Brandmand"
        case .military: return "Militær"
        case .teacher: return "Lærer"
        case .socialWorker: return "Socialrådgiver"
        case .midwife: return "Jordemoder"
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

// MARK: - Relationship intent & interests

/// What a member is looking for — shown on their profile and cards.
enum LookingFor: String, Codable, CaseIterable, Identifiable {
    case serious
    case casual
    case friends
    case unsure

    var id: String { rawValue }

    var label: String {
        switch self {
        case .serious: return "Seriøst forhold"
        case .casual: return "Noget afslappet"
        case .friends: return "Nye venner"
        case .unsure: return "Ved ikke endnu"
        }
    }

    var symbol: String {
        switch self {
        case .serious: return "heart.fill"
        case .casual: return "sparkles"
        case .friends: return "person.2.fill"
        case .unsure: return "questionmark.circle.fill"
        }
    }
}

/// The fixed catalogue members pick their interests from.
enum InterestCatalog {
    static let all: [String] = [
        "Løb", "Vinterbadning", "Kaffe", "Madlavning", "Rejser", "Livemusik",
        "Vandreture", "Fitness", "Yoga", "Fotografering", "Brætspil", "Hunde",
        "Katte", "Film & serier", "Bøger", "Klatring", "Cykling", "Havearbejde",
        "Kunst", "Frivilligt arbejde",
    ]
}

/// Work pattern — central for frontline staff who want a partner on similar
/// shifts. Filtering by this is a paid ("advanced filters") feature.
enum WorkSchedule: String, Codable, CaseIterable, Identifiable {
    case day
    case evening
    case night
    case rotating

    var id: String { rawValue }

    var label: String {
        switch self {
        case .day: return "Dagvagt"
        case .evening: return "Aftenvagt"
        case .night: return "Nattevagt"
        case .rotating: return "Skiftehold"
        }
    }

    var symbol: String {
        switch self {
        case .day: return "sun.max.fill"
        case .evening: return "sunset.fill"
        case .night: return "moon.stars.fill"
        case .rotating: return "arrow.triangle.2.circlepath"
        }
    }
}

// MARK: - Admin verification review

/// What an admin is asked to review for one applicant.
enum ReviewKind: String, Codable {
    case profession   // work ID / badge
    case photo        // selfie

    var label: String {
        switch self {
        case .profession: return "Arbejds-ID"
        case .photo: return "Selfie"
        }
    }
}

/// A pending verification request shown in the admin review queue.
struct AdminApplicant: Identifiable, Equatable {
    let id: UUID
    var name: String
    var profession: Profession
    var kind: ReviewKind
    /// True when this row represents the signed-in member's own submission.
    var isCurrentUser: Bool
    var gradientSeed: Int

    init(id: UUID = UUID(), name: String, profession: Profession, kind: ReviewKind,
         isCurrentUser: Bool = false, gradientSeed: Int = 0) {
        self.id = id
        self.name = name
        self.profession = profession
        self.kind = kind
        self.isCurrentUser = isCurrentUser
        self.gradientSeed = gradientSeed
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
    /// Set once the member passes the (mock) work-ID / profession check.
    var isVerified: Bool
    /// Set once the member passes the (mock) selfie / photo check.
    var photoVerified: Bool = false

    // Account (email is personal data; password is never stored on-device).
    var email: String = ""

    /// Verification submissions awaiting an admin's manual approval.
    var professionPending: Bool = false
    var photoPending: Bool = false

    // Extra profile content.
    var interests: [String] = []
    var lookingFor: LookingFor = .unsure
    var workSchedule: WorkSchedule = .day

    // Discovery preferences — free: gender, age, distance.
    var minAge: Int = 18
    var maxAge: Int = 60
    var maxDistanceKm: Int = 100
    // Advanced (paid) filters — empty means "no filter".
    var filterProfessions: [Profession] = []
    var filterSchedules: [WorkSchedule] = []

    /// Swipe gestures are ON by default (like other dating apps); buttons remain
    /// available so the member can switch to buttons-only if they prefer.
    var swipeEnabled: Bool = true

    /// A member is "fully verified" only when both checks have passed.
    var isFullyVerified: Bool { isVerified && photoVerified }

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

    // Resilient decoding: profiles saved by older builds are missing the newer
    // keys, so decode them with sensible defaults instead of failing.
    enum CodingKeys: String, CodingKey {
        case name, age, gender, profession, city, bio, seeking
        case isVerified, photoVerified, professionPending, photoPending
        case email, interests, lookingFor, workSchedule
        case minAge, maxAge, maxDistanceKm, filterProfessions, filterSchedules
        case swipeEnabled
    }

    init(name: String, age: Int, gender: Gender, profession: Profession,
         city: String, bio: String, seeking: [Gender], isVerified: Bool,
         photoVerified: Bool = false, professionPending: Bool = false,
         photoPending: Bool = false, email: String = "",
         interests: [String] = [], lookingFor: LookingFor = .unsure,
         workSchedule: WorkSchedule = .day, minAge: Int = 18, maxAge: Int = 60,
         maxDistanceKm: Int = 100, filterProfessions: [Profession] = [],
         filterSchedules: [WorkSchedule] = [], swipeEnabled: Bool = true) {
        self.name = name
        self.age = age
        self.gender = gender
        self.profession = profession
        self.city = city
        self.bio = bio
        self.seeking = seeking
        self.isVerified = isVerified
        self.photoVerified = photoVerified
        self.professionPending = professionPending
        self.photoPending = photoPending
        self.email = email
        self.interests = interests
        self.lookingFor = lookingFor
        self.workSchedule = workSchedule
        self.minAge = minAge
        self.maxAge = maxAge
        self.maxDistanceKm = maxDistanceKm
        self.filterProfessions = filterProfessions
        self.filterSchedules = filterSchedules
        self.swipeEnabled = swipeEnabled
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        name = try c.decode(String.self, forKey: .name)
        age = try c.decode(Int.self, forKey: .age)
        gender = try c.decode(Gender.self, forKey: .gender)
        profession = try c.decode(Profession.self, forKey: .profession)
        city = try c.decode(String.self, forKey: .city)
        bio = try c.decode(String.self, forKey: .bio)
        seeking = try c.decode([Gender].self, forKey: .seeking)
        isVerified = try c.decode(Bool.self, forKey: .isVerified)
        photoVerified = try c.decodeIfPresent(Bool.self, forKey: .photoVerified) ?? false
        professionPending = try c.decodeIfPresent(Bool.self, forKey: .professionPending) ?? false
        photoPending = try c.decodeIfPresent(Bool.self, forKey: .photoPending) ?? false
        email = try c.decodeIfPresent(String.self, forKey: .email) ?? ""
        interests = try c.decodeIfPresent([String].self, forKey: .interests) ?? []
        lookingFor = try c.decodeIfPresent(LookingFor.self, forKey: .lookingFor) ?? .unsure
        workSchedule = try c.decodeIfPresent(WorkSchedule.self, forKey: .workSchedule) ?? .day
        minAge = try c.decodeIfPresent(Int.self, forKey: .minAge) ?? 18
        maxAge = try c.decodeIfPresent(Int.self, forKey: .maxAge) ?? 60
        maxDistanceKm = try c.decodeIfPresent(Int.self, forKey: .maxDistanceKm) ?? 100
        filterProfessions = try c.decodeIfPresent([Profession].self, forKey: .filterProfessions) ?? []
        filterSchedules = try c.decodeIfPresent([WorkSchedule].self, forKey: .filterSchedules) ?? []
        swipeEnabled = try c.decodeIfPresent(Bool.self, forKey: .swipeEnabled) ?? true
    }
}

// MARK: - Privacy consent (GDPR)

/// Record of the consents a member has given. Under the GDPR, "seeking" gender
/// (an indication of sexual orientation) and the verification selfie
/// (biometric data) are **special categories** (Art. 9) and require *explicit*
/// consent — tracked separately here — on top of accepting the policy/terms.
struct PrivacyConsent: Codable, Equatable {
    var over18 = false
    var acceptedPolicyVersion: String?
    var acceptedTermsVersion: String?
    /// Explicit consent to process special-category data (orientation via
    /// "seeking", plus profession).
    var specialCategory = false
    /// Explicit consent to process the verification selfie (biometric).
    var biometric = false
    var updatedAt: Date?
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
    var interests: [String]
    var lookingFor: LookingFor
    var workSchedule: WorkSchedule

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
        gradientSeed: Int,
        interests: [String] = [],
        lookingFor: LookingFor = .unsure,
        workSchedule: WorkSchedule = .day
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
        self.interests = interests
        self.lookingFor = lookingFor
        self.workSchedule = workSchedule
    }
}

// MARK: - Chat

struct Message: Identifiable, Codable, Equatable {
    let id: UUID
    var text: String
    var fromMe: Bool
    var date: Date
    /// For messages I sent: whether the other person has seen it (read receipt).
    var seen: Bool = false

    init(id: UUID = UUID(), text: String, fromMe: Bool, date: Date = Date(), seen: Bool = false) {
        self.id = id
        self.text = text
        self.fromMe = fromMe
        self.date = date
        self.seen = seen
    }

    // Resilient decoding for messages saved before `seen` existed.
    enum CodingKeys: String, CodingKey { case id, text, fromMe, date, seen }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(UUID.self, forKey: .id)
        text = try c.decode(String.self, forKey: .text)
        fromMe = try c.decode(Bool.self, forKey: .fromMe)
        date = try c.decode(Date.self, forKey: .date)
        seen = try c.decodeIfPresent(Bool.self, forKey: .seen) ?? false
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
                  bio: "Intensivsygeplejerske på nattevagt. Kaffesnob, vinterbader, elendig til brætspil men konkurrerer alligevel.",
                  likesYou: true, gradientSeed: 1,
                  interests: ["Vinterbadning", "Kaffe", "Brætspil"], lookingFor: .serious,
                  workSchedule: .night),
        Candidate(name: "Jonas", age: 33, gender: .man, profession: .firefighter,
                  city: "Aarhus", distanceKm: 8,
                  bio: "Brandmand og tømrer på deltid. Hundefar til en meget dramatisk labrador.",
                  likesYou: false, gradientSeed: 2,
                  interests: ["Hunde", "Fitness", "Madlavning"], lookingFor: .serious,
                  workSchedule: .rotating),
        Candidate(name: "Sofie", age: 31, gender: .woman, profession: .police,
                  city: "Odense", distanceKm: 12,
                  bio: "Patruljebetjent, der slapper af med lange løbeture og true crime-podcasts (jeg ved det godt).",
                  likesYou: true, gradientSeed: 3,
                  interests: ["Løb", "Film & serier", "Rejser"], lookingFor: .casual,
                  workSchedule: .rotating),
        Candidate(name: "Anders", age: 36, gender: .man, profession: .doctor,
                  city: "København", distanceKm: 5,
                  bio: "Læge på skadestuen. Søger en, der forstår de skæve vagter og elsker en spontan roadtrip.",
                  likesYou: false, gradientSeed: 4,
                  interests: ["Rejser", "Madlavning", "Cykling"], lookingFor: .serious,
                  workSchedule: .night),
        Candidate(name: "Laura", age: 27, gender: .woman, profession: .paramedic,
                  city: "Aalborg", distanceKm: 21,
                  bio: "Ambulanceredder, klatrer, plantehamster. Jeg laver en fremragende negroni.",
                  likesYou: true, gradientSeed: 5,
                  interests: ["Klatring", "Havearbejde", "Livemusik"], lookingFor: .casual,
                  workSchedule: .rotating),
        Candidate(name: "Emil", age: 30, gender: .man, profession: .teacher,
                  city: "København", distanceKm: 4,
                  bio: "Lærer i 5. klasse. Vild med livemusik, dårlige ordspil og søndagens kanelsnurrer.",
                  likesYou: false, gradientSeed: 6,
                  interests: ["Livemusik", "Bøger", "Kaffe"], lookingFor: .friends,
                  workSchedule: .day),
        Candidate(name: "Freja", age: 34, gender: .woman, profession: .midwife,
                  city: "Roskilde", distanceKm: 30,
                  bio: "Jordemoder. Rolig under pres, kaotisk i køkkenet. Skal vi gå en tur?",
                  likesYou: true, gradientSeed: 7,
                  interests: ["Vandreture", "Yoga", "Madlavning"], lookingFor: .serious,
                  workSchedule: .rotating),
        Candidate(name: "Kasper", age: 32, gender: .man, profession: .military,
                  city: "Fredericia", distanceKm: 45,
                  bio: "Logistik i Forsvaret. Hjemmekok, vandrer, altid frisk på en ny rute eller en god pizza.",
                  likesYou: false, gradientSeed: 8,
                  interests: ["Vandreture", "Madlavning", "Fitness"], lookingFor: .serious,
                  workSchedule: .day),
        Candidate(name: "Ida", age: 28, gender: .woman, profession: .socialWorker,
                  city: "København", distanceKm: 6,
                  bio: "Socialrådgiver med en svaghed for keramik og latterligt lange brunches.",
                  likesYou: true, gradientSeed: 9,
                  interests: ["Kunst", "Kaffe", "Frivilligt arbejde"], lookingFor: .casual,
                  workSchedule: .day),
        Candidate(name: "Noah", age: 35, gender: .man, profession: .paramedic,
                  city: "Aarhus", distanceKm: 9,
                  bio: "Ambulanceredder og weekendcyklist. Spørg mig om de bedste kaffestop i Jylland.",
                  likesYou: false, gradientSeed: 10,
                  interests: ["Cykling", "Kaffe", "Fotografering"], lookingFor: .friends,
                  workSchedule: .evening),
    ]
}
