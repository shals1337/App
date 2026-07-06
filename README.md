# TaskWheel

A simple iOS app: spin a wheel and get a task to do. Built with SwiftUI.

> This repo also contains [`TrainingLog`](TrainingLog/README.md), an
> installable web app for logging workouts.

## Features

- **Spin the wheel** — tap *Spin* and the wheel animates to a random task.
- **Result card** — the chosen task is shown with *Spin Again* / *Done*.
- **Fully customizable** — add, edit, reorder, and delete the tasks on the
  wheel from the **Tasks** screen (list icon, top-right).
- **Persistent** — your task list is saved between launches (`UserDefaults`).
- Ships with neutral starter tasks; replace them with whatever you like.

## Requirements

- Xcode 15 or later
- iOS 17.0+ (simulator or device)

## Run

1. Open `TaskWheel.xcodeproj` in Xcode.
2. Select the **TaskWheel** scheme and an iPhone simulator.
3. Press **Run** (⌘R).

## Project layout

| File | Purpose |
|------|---------|
| `TaskWheelApp.swift` | App entry point; owns the shared `TaskStore`. |
| `ContentView.swift` | Main screen: wheel, spin logic, result sheet. |
| `WheelView.swift` | `Canvas`-drawn wheel, segment labels, and pointer. |
| `TaskListView.swift` | Add / edit / reorder / delete tasks. |
| `TaskStore.swift` | Observable store with `UserDefaults` persistence. |
| `Models.swift` | `WheelTask` model, sample data, and colour palette. |

## Customizing

- **Rename the app:** change the target's *Display Name* / `PRODUCT_NAME`, and
  `PRODUCT_BUNDLE_IDENTIFIER` (currently `com.example.TaskWheel`) in the target
  build settings.
- **Starter tasks:** edit `WheelTask.samples` in `Models.swift`.
- **Colors:** edit `WheelPalette.colors` in `Models.swift` and the
  `AccentColor` asset.
