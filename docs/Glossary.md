# 领域术语表

基于代码实体和领域文档，统一项目内术语定义。

---

## 一、核心实体

### Translation 上下文

| 术语 | 类型 | 定义 |
|------|------|------|
| **TranslationRequest** | Data Class | 翻译请求，包含输入文本 `text`、源语言 `sourceLanguage`（默认 zh）、目标语言 `targetLanguage` |
| **TranslationResult** | Data Class | 翻译结果，包含源文本 `sourceText`、译文 `translatedText`、源语言 `sourceLanguage`、目标语言 `targetLanguage` |

### Conversation 上下文

| 术语 | 类型 | 定义 |
|------|------|------|
| **VoiceMessage** | Data Class | 用户的语音消息，包含 ID `id`、识别后的文字 `text`、语言 `language`、时间戳 `timestamp` |
| **ChatMessage** | Data Class | 单条对话消息，包含 ID `id`、角色 `role`（USER / ASSISTANT）、内容 `content`、时间戳 `timestamp` |
| **ChatHistory** | Class | 对话历史，聚合多个 `ChatMessage`，提供添加、查询、清空操作，是对话上下文的**有状态**核心 |
| **ChatResponse** | Data Class | AI 回复结果，包含回复消息 `message`（ChatMessage 类型）和可选的音频数据 `audioData`（用于 TTS 播放） |

### Configuration 上下文

| 术语 | 类型 | 定义 |
|------|------|------|
| **AppConfig** | Data Class | 全局配置快照，包含目标语言 `targetLanguage`、LLM 提供商 `llmProvider`、各提供商 API Key 映射 `llmApiKeys`、Base URL 映射 `llmBaseUrls`、TTS 提供商 `ttsProvider` |
| **Language** | Data Class | 语言选项，包含语言代码 `code`、名称 `name`（如 "English"）、国旗 Emoji `flag`。内置支持 7 种语言：en / ja / ko / de / fr / es / zh |

### Shared

| 术语 | 类型 | 定义 |
|------|------|------|
| **Result\<T, E\>** | Sealed Class | 错误处理结果类型，有两个子类：`Ok(value)` 表示成功，`Err(error)` 表示失败。提供 `isOk()`、`isErr()`、`getOrNull()`、`errorOrNull()` 辅助方法 |
| **newId()** | 顶层函数 | 生成全局唯一 ID，底层使用 `UUID.randomUUID()` |

---

## 二、端口（Ports）

### 入站端口（Inbound — 由 UI 层调用）

| 术语 | 所属 BC | 定义 | 方法 |
|------|---------|------|------|
| **TranslationService** | Translation | 翻译服务入站端口，UI 调用此接口进行翻译 | `translate(text, targetLanguage): TranslationResult` |
| **ConversationService** | Conversation | 对话服务入站端口，UI 调用此接口进行对话 | `chat(userText, targetLanguage): ChatResponse`、`getHistory(): List<ChatMessage>`、`clearHistory()` |
| **ConfigService** | Configuration | 配置服务入站端口，UI 调用此接口管理配置 | `get/setTargetLanguage()`、`get/setLlmProvider()`、`get/setLlmApiKey()`、`get/setLlmBaseUrl()`、`getAllConfig()` |

### 出站端口（Outbound — 由适配器实现）

| 术语 | 所属 BC | 定义 | 方法 |
|------|---------|------|------|
| **LlmGateway** | Translation | LLM 出站端口，Translation 上下文用于执行翻译 | `translate(text, sourceLanguage, targetLanguage): TranslationResult` |
| **LlmChatGateway** | Conversation | LLM 出站端口，Conversation 上下文用于多轮对话 | `chat(messages, systemPrompt): ChatResponse` |
| **TtsGateway** | Conversation | 文字转语音出站端口 | `speak(text, language): ByteArray` |
| **SttGateway** | Conversation | 语音转文字出站端口 | `recognize(audioData, language): String` |
| **ConfigRepository** | Configuration | 配置持久化出站端口，负责读写持久化存储 | `get/setConfig()`、`get/setLlmApiKey()`、`get/setLlmBaseUrl()`、`get/setTargetLanguage()`、`get/setLlmProvider()` |

---

## 三、领域服务

| 术语 | 所属 BC | 定义 | 关键依赖 |
|------|---------|------|---------|
| **TranslationDomainService** | Translation | 翻译领域服务，实现 `TranslationService`，委托 `LlmGateway` 执行翻译 | LlmGateway |
| **ConversationDomainService** | Conversation | 对话领域服务，实现 `ConversationService`，维护 `ChatHistory`，委托 `LlmChatGateway` 对话 + `TtsGateway` 语音合成 | LlmChatGateway, TtsGateway |
| **ConfigDomainService** | Configuration | 配置领域服务，实现 `ConfigService`，委托 `ConfigRepository` 持久化 | ConfigRepository |

---

## 四、适配器

| 术语 | 目标平台 | 定义 | 实现的端口 |
|------|---------|------|-----------|
| **AndroidLlmAdapter** | Android | Android LLM 适配器，同时实现翻译和对话的 LLM 出站端口，支持 OpenAI 兼容 API | LlmGateway, LlmChatGateway |
| **AndroidConfigRepository** | Android | Android 配置持久化适配器，使用 SharedPreferences 存储 | ConfigRepository |

> 注：iOS 和 Desktop 适配器尚未实现（仅占位）。

---

## 五、供应商与模型

| 术语 | 类型 | 默认模型 | 说明 |
|------|------|---------|------|
| deepseek | LLM 提供商 | deepseek-chat | DeepSeek 云端 API |
| openai | LLM 提供商 | gpt-4 | OpenAI GPT 云端 API |
| gemini | LLM 提供商 | gemini-pro | Google Gemini 云端 API |
| ollama | LLM 提供商 | llama3 | 本地部署 Ollama |
| claude | LLM 提供商 | — | Anthropic Claude（预留） |
| vllm | LLM 提供商 | — | 本地部署 vLLM（预留） |

---

## 六、补充术语

| 术语 | 定义 |
|------|------|
| **六边形架构** | 将应用分为 Domain（核心业务）、Ports（端口）、Adapters（适配器）、Platform（UI）四层的架构模式 |
| **限界上下文（Bounded Context）** | DDD 概念，每个上下文有明确的业务边界，内部自洽，跨上下文通过显式接口通信 |
| **入站端口（Inbound Port）** | 由 Domain Service 实现、UI 层调用的接口，定义应用对外提供的服务 |
| **出站端口（Outbound Port）** | 由 Adapter 实现、Domain Service 依赖的接口，定义应用需要的外部能力 |
| **OpenAI 兼容 API** | 遵循 `/v1/chat/completions` 接口规范的 LLM API，DeepSeek、Ollama、vLLM 等都支持 |
