# learn-eng

跨平台英语学习助手。

## 技术栈

- **Android** → Kotlin（原生）
- **iOS** → Swift（原生）
- **桌面端** → Tauri + React（Windows / macOS / Linux）

## 架构

DDD 限界上下文（Bounded Context）+ 六边形架构（Hexagonal Architecture）

```
learn-eng/
├── shared/domain/                 # 核心业务（各平台共用）
│   ├── translation/               # 翻译限界上下文
│   │   ├── entities/              # TranslationRequest, TranslationResult
│   │   ├── ports/inbound/         # TranslationService 入站端口
│   │   ├── ports/outbound/        # LlmGateway 出站端口
│   │   └── services/              # TranslationDomainService
│   ├── conversation/              # 对话限界上下文
│   │   ├── entities/              # VoiceMessage, ChatMessage, ChatHistory
│   │   ├── ports/inbound/         # ConversationService 入站端口
│   │   ├── ports/outbound/        # LlmChatGateway, TtsGateway, SttGateway
│   │   └── services/             # ConversationDomainService
│   ├── configuration/             # 配置限界上下文
│   │   ├── entities/             # AppConfig, Language
│   │   ├── ports/inbound/        # ConfigService 入站端口
│   │   ├── ports/outbound/       # ConfigRepository 出站端口
│   │   └── services/              # ConfigDomainService
│   └── shared/                    # 跨上下文共享类型
│       └── SharedTypes.kt        # Result, newId()
├── shared/adapters/               # 各平台适配器实现
│   ├── android/
│   ├── ios/
│   └── desktop/
├── platform/                      # 各平台 UI 层
│   ├── android/
│   ├── ios/
│   └── desktop/
├── docs/
│   ├── PRD.md                     # 产品需求文档
│   └── DDD-Bounded-Context.md      # 限界上下文设计文档
└── mobile/                        # 各平台原生项目根目录
    ├── android/
    └── ios/
```

## 限界上下文

### Translation（翻译）
用户说一句中文 → 翻译成目标语言 → 显示结果
- 核心实体：TranslationRequest, TranslationResult
- 出站依赖：LlmGateway

### Conversation（对话）
用户说一句中文 → AI 用目标语言回复 → 显示文字 + 语音朗读
- 核心实体：VoiceMessage, ChatMessage, ChatHistory
- 出站依赖：LlmChatGateway, TtsGateway, SttGateway

### Configuration（配置）
管理目标语言、AI 模型、API Key 等
- 核心实体：AppConfig, Language
- 出站依赖：ConfigRepository

## 业务模式

### 翻译模式
用户说中文 → 翻译成目标语言（默认英文，可选其他语言）

### 对话模式
用户用母语说话 → AI 用指定语言与用户对话交流，文字+语音同步输出

## 开发

- `shared/domain/` 纯业务逻辑，可无 UI 单独测试
- `shared/adapters/` 各平台适配器，实现出站端口
- `platform/` 各平台 UI 入口，实现入站端口调用