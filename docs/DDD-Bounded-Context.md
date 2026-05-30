# 限界上下文（Bounded Context）划分文档

## 一、为什么需要限界上下文

当前所有实体（Entity）都堆在一个 `domain/entity/` 目录里，导致：

- **概念边界模糊** — `VoiceMessage`、`TranslationResult`、`AppConfig` 毫无关联，却放在同一层
- **变化原因分散** — 翻译逻辑变化和配置逻辑变化互相影响
- **难以分配团队** — 无法清晰划分谁负责哪块业务

限界上下文是 DDD 的核心概念：**每个上下文有自己明确的业务边界，内部自洽，跨上下文通过显式接口通信**。

---

## 二、业务边界分析

### 2.1 翻译模式
用户说一句中文 → 翻译成目标语言 → 显示结果

涉及的核心概念：
- 待翻译文本
- 翻译结果（源文本、译文、语种）
- 翻译语言对

这个业务是**独立的**：它不依赖对话历史，不依赖配置上下文。它只需要知道"输入什么语言，输出什么语言，翻译成什么"。

→ 构成一个限界上下文：**Translation（翻译）**

### 2.2 对话模式
用户说一句中文 → AI 用目标语言回复 → 显示文字 + 朗读语音

涉及的核心概念：
- 语音消息（用户说的原始内容）
- 对话消息（user / assistant 的交换）
- 对话历史
- AI 回复

这个业务也是**独立的**：它依赖翻译上下文提供的翻译能力（AI 用目标语言思考），但对话本身的业务是"交流"，和"翻译"是不同的活动。

→ 构成一个限界上下文：**Conversation（对话）**

### 2.3 配置管理
管理目标语言、AI 模型、API Key、TTS 选择等

这个业务是**独立的**：配置可以独立于翻译和对话存在，配置改变了才会影响前两个上下文的行为。

→ 构成一个限界上下文：**Configuration（配置）**

---

## 三、限界上下文定义

### Context 1：Translation（翻译）

**职责：** 将用户输入的文本翻译成目标语言

**核心实体：**
```
TranslationRequest    # 翻译请求（输入文本、源语言、目标语言）
TranslationResult     # 翻译结果（源文本、译文、源语言、目标语言）
```

**领域服务：**
```
TranslationService    # 翻译服务（给定文本和语种，产出翻译结果）
```

**出站端口：**
```
LlmGateway.translate()  # 调用外部 LLM 执行翻译（具体实现由 adapters 提供）
```

**边界说明：**
- 不持有对话历史
- 不关心谁调用了它（翻译模式 or 对话模式都可以用）
- 只负责"翻译"这件事

---

### Context 2：Conversation（对话）

**职责：** 管理对话流程，维护对话历史，生成 AI 回复，触发语音合成

**核心实体：**
```
VoiceMessage          # 用户语音消息（识别后的文字内容）
ChatMessage          # 对话消息（user/assistant 角色 + 内容）
ChatHistory          # 对话历史（多个 ChatMessage 的聚合）
```

**领域服务：**
```
ConversationService  # 对话服务（发送消息、获取回复、管理历史）
TtsService           # 语音合成服务（文本转语音播放）
```

**出站端口：**
```
LlmGateway.chat()       # 调用外部 LLM 对话
TtsGateway.speak()      # 调用外部 TTS 语音合成
SttGateway.recognize()  # 调用外部 STT 语音识别
```

**边界说明：**
- 持有对话历史（ChatHistory 是有状态的）
- 依赖 Translation 上下文（通过 LlmGateway 间接使用，但不需要知道翻译的具体实现）
- 对话上下文会调用 TTS 播放回复（翻译上下文不关心语音）

---

### Context 3：Configuration（配置）

**职责：** 管理应用全局配置，包括目标语言、AI 模型、API Key、TTS 选择等

**核心实体：**
```
AppConfig            # 完整配置快照
Language             # 语言选项（代码、名称、emoji）
```

**领域服务：**
```
ConfigService        # 配置服务（读写配置）
```

**出站端口：**
```
ConfigRepository     # 配置持久化（SharedPreferences / UserDefaults / 文件等）
```

**边界说明：**
- 纯粹的数据上下文，不包含业务规则
- 其他上下文通过 ConfigRepository 读取配置，不直接依赖 ConfigService
- 配置改变了，其他上下文按需响应（比如下次请求使用新的 targetLanguage）

---

### Context 4：Shared（跨上下文共享）

**职责：** 存放被多个限界上下文引用的通用类型，避免循环依赖

**包含：**
```
Language             # 语言枚举（各上下文都用，但不放业务逻辑）
UUIDGenerator        # ID 生成工具
Result<T, E>         # 错误处理结果类型
```

---

## 四、上下文映射关系（Context Mapping）

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Translation   │     │   Conversation  │     │   Configuration │
│    Context      │     │    Context      │     │    Context      │
│                 │     │                 │     │                 │
│ - Translation   │     │ - VoiceMessage  │     │ - AppConfig     │
│   Request       │     │ - ChatMessage   │     │ - Language      │
│ - Translation   │     │ - ChatHistory   │     │ - ConfigService │
│   Result        │     │ - Conversation  │     │ - ConfigRepo    │
│ - Translation   │     │   Service       │     │                 │
│   Service       │     │ - TtsService    │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │    LlmGateway        │    LlmGateway         │  ConfigRepo
         │    TtsGateway        │    TtsGateway         │
         └──────────────────────┴───────────────────────┘
                              │
                      ┌───────┴───────┐
                      │  OpenAI-style  │
                      │  LLM API      │
                      └───────────────┘
```

**关系说明：**
- **Translation** 和 **Conversation** 都依赖 `LlmGateway`（出站端口），但互相不知道对方的存在
- **Conversation** 依赖 `TtsGateway` 做语音输出
- **Configuration** 被 Translation 和 Conversation 通过 `ConfigRepository` 间接引用（读取目标语言等配置）
- **Shared** 是纯类型共享，无依赖关系

---

## 五、Ports 接口归属

**属于 Translation 上下文的入站端口：**
- `TranslationService`（入站，由 platform UI 调用）

**属于 Conversation 上下文的入站端口：**
- `ConversationService`（入站，由 platform UI 调用）

**属于 Configuration 上下文的入站端口：**
- `ConfigService`（入站，由 platform UI 调用）

**出站端口归属（哪个上下文需要就哪个上下文定义）：**
- `LlmGateway` — Translation 和 Conversation 都要用，分别调用 chat 和 translate 方法
- `TtsGateway` — Conversation 专用
- `SttGateway` — Conversation 专用（语音识别）
- `ConfigRepository` — Configuration 内部实现，也被其他上下文间接依赖

---

## 六、团队分工友好性

| 限界上下文 | 核心开发者 | 独立测试能力 |
|-----------|-----------|------------|
| Translation | 后端 / 全栈 | 可脱离 UI 单独测试翻译逻辑 |
| Conversation | 后端 / 全栈 | 可脱离 UI 单独测试对话流程 |
| Configuration | 后端 / 全栈 | 可脱离 UI 单独测试配置读写 |
| Platform Android/iOS/Desktop | 移动/桌面端 | 只需实现入站端口调用 |

---

## 七、验收标准

- [ ] 每个限界上下文目录内各自组织 entity / service / ports
- [ ] 跨上下文无循环依赖
- [ ] Translation 和 Conversation 可独立运行单元测试（mock 出站端口）
- [ ] 新增一个 AI provider（如 Gemini）只需实现 `LlmGateway` 一个接口