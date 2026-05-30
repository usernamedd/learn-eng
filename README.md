# learn-eng

跨平台英语学习助手。

## 技术栈

- **Android** → Kotlin（原生）
- **iOS** → Swift（原生）
- **桌面端** → Tauri + React（Windows / macOS / Linux）

## 项目结构

```
learn-eng/
├── mobile/
│   ├── android/      # Android Studio 项目
│   └── ios/          # Xcode 项目
├── desktop/          # Tauri + React 桌面应用
│   ├── src/         # React 前端
│   └── src-tauri/   # Rust 后端
└── shared/          # 共用业务逻辑
```

## 开发

各平台独立开发，共用 `shared/` 下的核心逻辑。