package shared.domain.conversation.ports.inbound

import shared.domain.conversation.entities.ChatMessage
import shared.domain.conversation.entities.ChatResponse

/**
 * 对话服务入站端口
 * platform UI 调用此接口使用对话能力
 */
interface ConversationService {
    suspend fun chat(userText: String, targetLanguage: String): ChatResponse
    fun getHistory(): List<ChatMessage>
    fun clearHistory()
}