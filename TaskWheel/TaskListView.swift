import SwiftUI

/// Manage (add / edit / delete / reorder) the tasks shown on the wheel.
struct TaskListView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.dismiss) private var dismiss

    @State private var newTask = ""
    @State private var editingTask: WheelTask?
    @State private var showResetConfirm = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        TextField("New task", text: $newTask)
                            .submitLabel(.done)
                            .onSubmit(addTask)
                        Button(action: addTask) {
                            Image(systemName: "plus.circle.fill")
                        }
                        .disabled(newTask.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }

                Section("Tasks (\(store.tasks.count))") {
                    ForEach(store.tasks) { task in
                        Text(task.text)
                            .contentShape(Rectangle())
                            .onTapGesture { editingTask = task }
                    }
                    .onDelete(perform: store.remove)
                    .onMove(perform: store.move)
                }
            }
            .navigationTitle("Tasks")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Reset", role: .destructive) { showResetConfirm = true }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .bottomBar) {
                    EditButton()
                }
            }
            .sheet(item: $editingTask) { task in
                EditTaskView(task: task)
            }
            .confirmationDialog("Reset to starter tasks?",
                                isPresented: $showResetConfirm,
                                titleVisibility: .visible) {
                Button("Reset", role: .destructive) { store.resetToSamples() }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This replaces your current list with the default tasks.")
            }
        }
    }

    private func addTask() {
        store.add(newTask)
        newTask = ""
    }
}

/// Simple editor for a single task's text.
struct EditTaskView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.dismiss) private var dismiss

    let task: WheelTask
    @State private var text: String

    init(task: WheelTask) {
        self.task = task
        _text = State(initialValue: task.text)
    }

    var body: some View {
        NavigationStack {
            Form {
                TextField("Task", text: $text, axis: .vertical)
                    .lineLimit(1...4)
            }
            .navigationTitle("Edit Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        store.update(task, text: text)
                        dismiss()
                    }
                    .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .presentationDetents([.height(220)])
    }
}

#Preview {
    TaskListView().environmentObject(TaskStore())
}
