package shared.ports.inbound

import shared.domain.entity.ChatMessage
import shared.domain.entity.ChatResponse
import shared.domain.entity.TranslationResult

/**
 * 入站端口：翻译服务
 * 翻译模式的核心接口，platform UI 层调用此接口
 */
interface TranslationService {
    /**
     * 翻译文本
     * @param text 待翻译文本（用户语音识别后的文字）
     * @param targetLanguage 目标语言
     * @return 翻译结果
     */
    suspend fun translate(text: String, targetLanguage: String): TranslationResult
}

/**
 * 入站端口：对话服务
 * 对话模式的核心接口，platform UI 层调用此接口
 */
interface ConversationService {
    /**
     * 发送用户消息，获取 AI 回复
     * @param userText 用户输入文字
     * @param targetLanguage AI 回复使用的语言
     * @return AI 回复（包含文字和可选的语音数据）
     */
    suspend fun chat(userText: String, targetLanguage: String): ChatResponse

    /**
     * 获取当前对话历史
     */
    fun getHistory(): List<ChatMessage>

    /**
     * 清除对话历史
     */
    fun clearHistory()
}

/**
 * 入站端口：配置服务
 * platform UI 层通过此接口管理配置
 */
interface ConfigService {
    fun getTargetLanguage(): String
    fun setTargetLanguage(lang: String)
    fun getLlmProvider(): String
    fun setLlmProvider(provider: String)
    fun getLlmApiKey(provider: String): String?
    fun setLlmApiKey(provider: String, key: String)
    fun getLlmBaseUrl(provider: String): String?
    fun setLlmBaseUrl(provider: String, url: String)
    fun getAllConfig(): Map<String, Any>
}