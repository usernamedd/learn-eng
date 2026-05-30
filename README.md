# learn-eng

跨平台英语学习助手。

## 技术栈

- **Android** → Kotlin（原生）
- **iOS** → Swift（原生）
- **桌面端** → Tauri + React（Windows / macOS / Linux）

## 架构

六边形架构（Hexagonal Architecture），核心业务与平台解耦。

```
learn-eng/
├── shared/                 # 核心业务（各平台共用）
│   ├── domain/            # 领域层：实体 + 领域服务
│   │   ├── entity/        # 实体定义
│   │   └── service/       # 领域服务
│   ├── application/        # 用例层：编排业务
│   ├── ports/             # 接口层：定义端口
│   │   ├── inbound/       # 入站端口（外部调用接口）
│   │   └── outbound/      # 出站端口（外部依赖接口）
│   └── adapters/          # 适配器层：接口实现
│       ├── android/
│       ├── ios/
│       └── desktop/
├── platform/              # 各平台 UI 层
│   ├── android/           # Android ViewModel/UI
│   ├── ios/               # iOS ViewController/UI
│   └── desktop/           # Tauri React 组件
└── mobile/                # 各平台原生项目根目录
    ├── android/           # Android Studio 项目
    └── ios/               # Xcode 项目
```

## 业务模式

### 翻译模式
用户说中文 → 翻译成目标语言（默认英文，可选其他语言）

### 对话模式
用户用母语说话 → AI 用指定语言（如英语）与用户对话交流

## 开发

- `shared/` 纯 Kotlin/Swift 业务逻辑，可在任何平台运行
- `platform/` 是各平台 UI 入口，实现 inbound port
- `shared/adapters/` 是各平台适配器，实现 outbound port