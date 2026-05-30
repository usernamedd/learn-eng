package shared.ports.outbound

import shared.domain.entity.ChatMessage
import shared.domain.entity.ChatResponse
import shared.domain.entity.TranslationResult

/**
 * 出站端口：LLM 网关
 * 定义与 AI 大模型交互的接口，各平台/各 provider 实现此接口
 */
interface LlmGateway {
    /** 提供商名称，如 "deepseek", "openai", "ollama" */
    val provider: String

    /**
     * 对话
     * @param messages 对话历史（包含 user 和 assistant 的消息）
     * @param systemPrompt 系统提示词
     * @return AI 回复
     */
    suspend fun chat(messages: List<ChatMessage>, systemPrompt: String? = null): ChatResponse

    /**
     * 翻译
     * @param text 待翻译文本
     * @param sourceLanguage 源语言代码
     * @param targetLanguage 目标语言代码
     * @return 翻译结果
     */
    suspend fun translate(
        text: String,
        sourceLanguage: String,
        targetLanguage: String
    ): TranslationResult
}

/**
 * 出站端口：语音合成（TTS）
 */
interface TtsGateway {
    val provider: String

    /**
     * 将文字转为语音
     * @param text 文本
     * @param language 语言代码
     * @return 音频数据（byte array）
     */
    suspend fun speak(text: String, language: String): ByteArray
}

/**
 * 出站端口：语音识别（STT）
 */
interface SttGateway {
    val provider: String

    /**
     * 将语音数据转为文字
     * @param audioData 音频数据
     * @param language 音频语种
     * @return 识别出的文字
     */
    suspend fun recognize(audioData: ByteArray, language: String): String
}

/**
 * 出站端口：配置管理
 * 管理应用配置持久化
 */
interface ConfigRepository {
    fun getConfig(): AppConfig
    fun saveConfig(config: AppConfig)
    fun getLlmApiKey(provider: String): String?
    fun setLlmApiKey(provider: String, key: String)
    fun getLlmBaseUrl(provider: String): String?
    fun setLlmBaseUrl(provider: String, url: String)
    fun getTargetLanguage(): String
    fun setTargetLanguage(lang: String)
    fun getLlmProvider(): String
    fun setLlmProvider(provider: String)
}