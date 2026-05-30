package shared.domain.conversation.entities

/**
 * 用户语音消息（识别后的文字）
 */
data class VoiceMessage(
    val id: String,
    val text: String,
    val language: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * 对话消息
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
 * AI 回复结果
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

/**
 * 对话历史
 */
class ChatHistory {
    private val messages = mutableListOf<ChatMessage>()

    fun add(message: ChatMessage) = messages.add(message)

    fun addUser(text: String): ChatMessage {
        val msg = ChatMessage(
            id = java.util.UUID.randomUUID().toString(),
            role = ChatMessage.Role.USER,
            content = text
        )
        messages.add(msg)
        return msg
    }

    fun addAssistant(text: String): ChatMessage {
        val msg = ChatMessage(
            id = java.util.UUID.randomUUID().toString(),
            role = ChatMessage.Role.ASSISTANT,
            content = text
        )
        messages.add(msg)
        return msg
    }

    fun toList(): List<ChatMessage> = messages.toList()

    fun clear() = messages.clear()

    fun size(): Int = messages.size
}