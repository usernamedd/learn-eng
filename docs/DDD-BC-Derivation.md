# 限界上下文推导过程

## 概述

本文档记录了 learn-eng 项目中限界上下文（Bounded Context）的推导过程：从 PRD 需求出发，经过业务边界分析，最终得到 3 个业务限界上下文 + 1 个共享层。

---

## 一、输入：PRD 需求

原始输入为 [`PRD.md`](PRD.md)，包含三个用户需求层次：

### 1.1 翻译练习需求

> 用户想说一句中文，程序能翻译成目标语言（默认英文，可切换其他语言）。
> 用户可以说一句完整的句子，得到一句翻译结果。
> 翻译结果以文字形式展示给用户。

### 1.2 对话练习需求

> 用户用母语（中文）说话，程序用目标语言与用户对话交流。
> AI 回复不仅显示文字，还通过语音朗读出来。
> 用户可以选择 AI 使用的目标语言（默认英文，可切换）。

### 1.3 灵活性 / 配置需求

> 目标语言可自由切换，切换后两种模式立即生效。
> AI 模型可自由切换（云服务或本地部署）。
> API Key、模型参数等可在应用内配置。
> 应用提供配置管理界面。

---

## 二、中间过程：业务边界分析

对每个需求模式，分析其核心概念集合，判断它是否构成一个独立的限界上下文。
判断标准：**该模式的核心概念是否自洽？是否依赖其他模式的状态或职责？**

### 2.1 翻译模式分析

**核心概念：**

| 概念 | 说明 |
|------|------|
| 待翻译文本 | 用户输入的源语言内容 |
| 翻译结果 | 源文本 + 译文 + 语种 |
| 翻译语言对 | 源语言 → 目标语言 |

**边界判断：**

- ✅ 不依赖对话历史
- ✅ 不关心谁调用了它（翻译模式 or 对话模式都可以用）
- ✅ 只负责"翻译"这一件事
- ❌ 不需要语音能力

**结论：独立 → Translation（翻译）限界上下文**

### 2.2 对话模式分析

**核心概念：**

| 概念 | 说明 |
|------|------|
| 语音消息 | 用户说的原始内容（经过语音识别） |
| 对话消息 | user / assistant 的交换记录 |
| 对话历史 | 多个 ChatMessage 的聚合（有状态） |
| AI 回复 | LLM 用目标语言生成的回复 |
| 语音朗读 | 将 AI 回复用 TTS 播报 |

**边界判断：**

- ✅ 持有对话历史（有状态）
- ✅ 依赖 LLM 对话能力（但和翻译的 LLM 调用是不同的方法）
- ✅ 依赖 TTS 做语音输出（翻译模式不关心语音）
- ❌ 不依赖翻译上下文的内部状态
- ❌ 不负责配置管理

**结论：独立 → Conversation（对话）限界上下文**

### 2.3 配置管理分析

**核心概念：**

| 概念 | 说明 |
|------|------|
| 目标语言 | 当前选中的学习语言 |
| AI 模型 | 使用的 LLM 服务提供商 |
| API Key | 各服务商的认证凭据 |
| TTS 选择 | 语音合成引擎 |

**边界判断：**

- ✅ 纯粹的数据上下文，不包含业务规则
- ✅ 可以独立于翻译和对话存在
- ✅ 配置改变了才会影响前两个上下文的行为
- ❌ 不依赖翻译或对话的内部状态

**结论：独立 → Configuration（配置）限界上下文**

### 2.4 跨上下文共享分析

**被多个上下文引用的通用类型：**

| 类型 | 被哪些上下文使用 |
|------|----------------|
| Language（语言枚举） | Translation, Conversation, Configuration |
| Result<T, E>（错误处理） | Translation, Conversation, Configuration |
| UUIDGenerator（ID 生成） | Translation, Conversation |

**判断：** 这些类型没有业务逻辑，但被多个 BC 引用。放入任何一个 BC 都会导致其他 BC 依赖它，造成不必要的耦合。

**结论：剥离 → Shared（共享层）**

---

## 三、输出：3 + 1 个限界上下文

### 3.1 上下文总览

| # | 上下文 | 核心实体 | 领域服务 | 出站端口 |
|---|--------|---------|---------|---------|
| 1 | **Translation** | TranslationRequest, TranslationResult | TranslationService | LlmGateway.translate() |
| 2 | **Conversation** | VoiceMessage, ChatMessage, ChatHistory | ConversationService, TtsService | LlmGateway.chat(), TtsGateway, SttGateway |
| 3 | **Configuration** | AppConfig, Language | ConfigService | ConfigRepository |
| — | **Shared** | Language, Result, UUIDGenerator | — | — |

### 3.2 上下文映射关系

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

### 3.3 关键设计原则

1. **Translation 和 Conversation** 互相不知道对方存在，都通过 `LlmGateway`（出站端口）调用 LLM
2. **Conversation** 额外依赖 `TtsGateway`（语音输出）和 `SttGateway`（语音识别）
3. **Configuration** 被其他上下文通过 `ConfigRepository` 间接引用（只读配置）
4. **Shared** 是纯类型共享，无依赖关系

---

## 四、迭代记录

| 步骤 | Commit | 说明 |
|------|--------|------|
| 项目初始化 | `e62efb3` | 跨平台项目骨架 |
| PRD 需求文档 | `020793f` | 撰写需求文档 |
| 六边形架构落地 | `e7bc65d` | 按标准六边形结构组织代码（扁平 entity/service/ports） |
| 核心代码框架 | `9db28ec` | 实现实体、端口、适配器 |
| BC 设计文档 | `898a282` | 撰写限界上下文划分文档 |
| BC 代码重构 | `22966a4` | 按 BC 拆分目录，删除旧扁平结构 |

---

## 五、参考

- [PRD.md](PRD.md) — 原始需求文档
- [DDD-Bounded-Context.md](DDD-Bounded-Context.md) — 限界上下文详细定义
