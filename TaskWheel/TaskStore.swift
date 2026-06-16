import SwiftUI
import Combine

/// Owns the list of wheel tasks and persists them to `UserDefaults`.
final class TaskStore: ObservableObject {
    @Published var tasks: [WheelTask] {
        didSet { save() }
    }

    private let defaultsKey = "wheel.tasks.v1"

    init() {
        if let data = UserDefaults.standard.data(forKey: defaultsKey),
           let decoded = try? JSONDecoder().decode([WheelTask].self, from: data) {
            tasks = decoded
        } else {
            tasks = WheelTask.samples
        }
    }

    func add(_ text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        tasks.append(WheelTask(text: trimmed))
    }

    func update(_ task: WheelTask, text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let index = tasks.firstIndex(of: task) else { return }
        tasks[index].text = trimmed
    }

    func remove(at offsets: IndexSet) {
        tasks.remove(atOffsets: offsets)
    }

    func move(from source: IndexSet, to destination: Int) {
        tasks.move(fromOffsets: source, toOffset: destination)
    }

    func resetToSamples() {
        tasks = WheelTask.samples
    }

    private func save() {
        if let data = try? JSONEncoder().encode(tasks) {
            UserDefaults.standard.set(data, forKey: defaultsKey)
        }
    }
}
