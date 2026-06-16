import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: TaskStore

    @State private var rotation: Double = 0
    @State private var isSpinning = false
    @State private var result: WheelTask?
    @State private var showResult = false
    @State private var showTasks = false

    private let spinDuration: Double = 3.2

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if store.tasks.isEmpty {
                    emptyState
                } else {
                    wheel
                    spinButton
                }
            }
            .padding()
            .navigationTitle("Spin the Wheel")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showTasks = true
                    } label: {
                        Label("Tasks", systemImage: "list.bullet")
                    }
                }
            }
            .sheet(isPresented: $showTasks) {
                TaskListView()
            }
            .sheet(isPresented: $showResult) {
                ResultView(task: result) {
                    showResult = false
                } onSpinAgain: {
                    showResult = false
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                        spin()
                    }
                }
                .presentationDetents([.medium])
            }
        }
    }

    private var wheel: some View {
        ZStack(alignment: .top) {
            WheelView(tasks: store.tasks, rotation: rotation)
                .aspectRatio(1, contentMode: .fit)

            WheelPointer()
                .offset(y: -6)
        }
        .padding(.horizontal, 8)
    }

    private var spinButton: some View {
        Button(action: spin) {
            Text(isSpinning ? "Spinning…" : "Spin")
                .font(.title2.bold())
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
        }
        .buttonStyle(.borderedProminent)
        .disabled(isSpinning || store.tasks.isEmpty)
        .padding(.horizontal)
    }

    private var emptyState: some View {
        ContentUnavailableView {
            Label("No tasks yet", systemImage: "list.bullet.rectangle")
        } description: {
            Text("Add some tasks to spin the wheel.")
        } actions: {
            Button("Add Tasks") { showTasks = true }
                .buttonStyle(.borderedProminent)
        }
    }

    private func spin() {
        guard !store.tasks.isEmpty, !isSpinning else { return }
        isSpinning = true

        let count = store.tasks.count
        let segAngle = 360.0 / Double(count)
        let target = Int.random(in: 0..<count)

        // Angle (clockwise from top) of the chosen segment's centre.
        let centerAngle = Double(target) * segAngle + segAngle / 2
        // We want the wheel rotated so that centre lands under the top pointer.
        let desiredMod = (360 - centerAngle).truncatingRemainder(dividingBy: 360)
        let currentMod = rotation.truncatingRemainder(dividingBy: 360)
        var delta = desiredMod - currentMod
        if delta < 0 { delta += 360 }

        let fullSpins = 5.0
        withAnimation(.easeOut(duration: spinDuration)) {
            rotation += fullSpins * 360 + delta
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + spinDuration) {
            isSpinning = false
            // Resolve against the live list in case it changed mid-spin.
            if target < store.tasks.count {
                result = store.tasks[target]
                showResult = true
            }
        }
    }
}

/// Shown when the wheel stops, presenting the chosen task.
struct ResultView: View {
    let task: WheelTask?
    let onDone: () -> Void
    let onSpinAgain: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Text("Your task")
                .font(.headline)
                .foregroundStyle(.secondary)

            Text(task?.text ?? "—")
                .font(.largeTitle.bold())
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()

            VStack(spacing: 12) {
                Button(action: onSpinAgain) {
                    Text("Spin Again")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(.borderedProminent)

                Button("Done", action: onDone)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.top, 32)
        .padding()
    }
}

#Preview {
    ContentView().environmentObject(TaskStore())
}
