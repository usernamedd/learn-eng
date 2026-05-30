package shared.domain.conversation.services

import shared.domain.conversation.entities.ChatHistory
import shared.domain.conversation.entities.ChatMessage
import shared.domain.conversation.entities.ChatResponse
import shared.domain.conversation.ports.inbound.ConversationService
import shared.domain.conversation.ports.outbound.LlmChatGateway
import shared.domain.conversation.ports.outbound.TtsGateway

/**
 * 对话领域服务
 * Conversation 上下文的核心服务实现
 */
class ConversationDomainService(
    private val llmChatGateway: LlmChatGateway,
    private val ttsGateway: TtsGateway
) : ConversationService {

    private val history = ChatHistory()

    private val systemPrompt = """You are a helpful language learning assistant.
You are currently helping a user practice a foreign language.
Please respond in the target language the user is learning.
Keep your responses concise and educational.
When the user makes mistakes, you can gently correct them."""

    override suspend fun chat(userText: String, targetLanguage: String): ChatResponse {
        // 构建消息列表
        val messages = history.toList() + ChatMessage(
            id = java.util.UUID.randomUUID().toString(),
            role = ChatMessage.Role.USER,
            content = userText
        )

        // 调用 LLM
        val response = llmChatGateway.chat(messages, systemPrompt)

        // 更新历史
        history.addUser(userText)
        history.addAssistant(response.message.content)

        // 合成语音
        val audioData = try {
            ttsGateway.speak(response.message.content, targetLanguage)
        } catch (e: Exception) {
            null
        }

        return response.copy(audioData = audioData)
    }

    override fun getHistory(): List<ChatMessage> = history.toList()

    override fun clearHistory() = history.clear()
}