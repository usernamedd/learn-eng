package shared.application

import shared.domain.entity.ChatMessage
import shared.domain.entity.ChatResponse
import shared.domain.entity.TranslationResult
import shared.ports.inbound.ConversationService
import shared.ports.inbound.TranslationService
import shared.ports.outbound.LlmGateway
import shared.ports.outbound.TtsGateway

/**
 * 翻译用例
 */
class TranslateUseCase(
    private val llmGateway: LlmGateway
) : TranslationService {

    override suspend fun translate(text: String, targetLanguage: String): TranslationResult {
        return llmGateway.translate(
            text = text,
            sourceLanguage = "zh",
            targetLanguage = targetLanguage
        )
    }
}

/**
 * 对话用例
 */
class ChatUseCase(
    private val llmGateway: LlmGateway,
    private val ttsGateway: TtsGateway
) : ConversationService {

    private val history = mutableListOf<ChatMessage>()

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
        val response = llmGateway.chat(messages, systemPrompt)

        // 更新历史
        history.add(ChatMessage(
            id = java.util.UUID.randomUUID().toString(),
            role = ChatMessage.Role.USER,
            content = userText
        ))
        history.add(response.message)

        // 合成语音
        val audioData = try {
            ttsGateway.speak(response.message.content, targetLanguage)
        } catch (e: Exception) {
            null // TTS 失败不影响文字回复
        }

        return response.copy(audioData = audioData)
    }

    override fun getHistory(): List<ChatMessage> = history.toList()

    override fun clearHistory() {
        history.clear()
    }
}