package shared.domain.entity

/**
 * 语音消息
 * @param id 唯一标识
 * @param text 文字内容
 * @param language 语种（如 "zh", "en"）
 * @param timestamp 录制时间
 */
data class VoiceMessage(
    val id: String,
    val text: String,
    val language: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * 对话消息
 * @param id 唯一标识
 * @param role 角色：user / assistant
 * @param content 消息内容
 * @param timestamp 发送时间
 */
data class ChatMessage(
    val id: String,
    val role: Role,
    val content: String,
    val timestamp: Long = System.currentTimeMillis()
) {
    enum class Role { USER, ASSISTANT }
}

/**
 * 翻译结果
 * @param sourceText 原始文本
 * @param translatedText 翻译文本
 * @param sourceLanguage 源语言
 * @param targetLanguage 目标语言
 */
data class TranslationResult(
    val sourceText: String,
    val translatedText: String,
    val sourceLanguage: String,
    val targetLanguage: String
)

/**
 * AI 回复结果
 * @param message 回复消息
 * @param audioData 语音数据（可为 null）
 */
data class ChatResponse(
    val message: ChatMessage,
    val audioData: ByteArray? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as ChatResponse
        return message == other.message
    }

    override fun hashCode(): Int = message.hashCode()
}