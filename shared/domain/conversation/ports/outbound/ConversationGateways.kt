package shared.domain.conversation.ports.outbound

import shared.domain.conversation.entities.ChatMessage
import shared.domain.conversation.entities.ChatResponse

/**
 * LLM 出站端口（对话方法）
 * Conversation 上下文定义，adapters 实现
 */
interface LlmChatGateway {
    val provider: String

    suspend fun chat(
        messages: List<ChatMessage>,
        systemPrompt: String?
    ): ChatResponse
}

/**
 * TTS 出站端口
 * Conversation 上下文定义，adapters 实现
 */
interface TtsGateway {
    val provider: String

    /**
     * 将文字转为语音
     * @return 音频数据 byte array
     */
    suspend fun speak(text: String, language: String): ByteArray
}

/**
 * STT 出站端口
 * Conversation 上下文定义，adapters 实现
 */
interface SttGateway {
    val provider: String

    /**
     * 将语音转为文字
     */
    suspend fun recognize(audioData: ByteArray, language: String): String
}