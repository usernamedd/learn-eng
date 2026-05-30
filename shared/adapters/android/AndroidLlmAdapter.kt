package shared.adapters.android

import com.google.gson.Gson
import com.google.gson.JsonObject
import shared.domain.conversation.entities.ChatMessage
import shared.domain.conversation.entities.ChatResponse
import shared.domain.conversation.ports.outbound.LlmChatGateway
import shared.domain.translation.entities.TranslationResult
import shared.domain.translation.ports.outbound.LlmGateway
import java.util.UUID

/**
 * Android LLM 适配器
 * 同时实现 Translation 上下文的 LlmGateway 和 Conversation 上下文的 LlmChatGateway
 * 支持 OpenAI 兼容 API（DeepSeek / GPT / Ollama / vLLM 等）
 */
class AndroidLlmAdapter(
    private val apiKey: String,
    private val baseUrl: String,
    override val provider: String
) : LlmGateway, LlmChatGateway {

    private val json = Gson()

    // ============== LlmGateway (Translation) ==============

    override suspend fun translate(
        text: String,
        sourceLanguage: String,
        targetLanguage: String
    ): TranslationResult {
        val prompt = "Translate the following text from $sourceLanguage to $targetLanguage. " +
                "Only output the translation, no explanations.\n\n$text"

        val body = mapOf(
            "model" to getModelName(),
            "messages" to listOf(mapOf("role" to "user", "content" to prompt)),
            "stream" to false
        )

        val response = sendRequest("/chat/completions", body)

        val translated = response.getAsJsonArray("choices")
            .first()?.asJsonObject
            ?.getAsJsonObject("message")
            ?.get("content")?.asString
            ?: ""

        return TranslationResult(
            sourceText = text,
            translatedText = translated.trim(),
            sourceLanguage = sourceLanguage,
            targetLanguage = targetLanguage
        )
    }

    // ============== LlmChatGateway (Conversation) ==============

    override suspend fun chat(messages: List<ChatMessage>, systemPrompt: String?): ChatResponse {
        val allMessages = if (systemPrompt != null) {
            listOf(ChatMessage(
                id = UUID.randomUUID().toString(),
                role = ChatMessage.Role.USER,
                content = systemPrompt
            )) + messages
        } else messages

        val body = mapOf(
            "model" to getModelName(),
            "messages" to allMessages.map { msg ->
                mapOf(
                    "role" to when (msg.role) {
                        ChatMessage.Role.USER -> "user"
                        ChatMessage.Role.ASSISTANT -> "assistant"
                    },
                    "content" to msg.content
                )
            },
            "stream" to false
        )

        val response = sendRequest("/chat/completions", body)

        val reply = response.getAsJsonArray("choices")
            .first()?.asJsonObject
            ?.getAsJsonObject("message")
            ?.get("content")?.asString
            ?: ""

        return ChatResponse(
            message = ChatMessage(
                id = UUID.randomUUID().toString(),
                role = ChatMessage.Role.ASSISTANT,
                content = reply
            )
        )
    }

    // ============== Common ==============

    private fun getModelName(): String = when (provider) {
        "deepseek" -> "deepseek-chat"
        "openai" -> "gpt-4"
        "ollama" -> "llama3"
        "gemini" -> "gemini-pro"
        else -> "gpt-4"
    }

    private fun sendRequest(endpoint: String, body: Map<String, Any?>): JsonObject {
        val url = java.net.URL("$baseUrl$endpoint")
        val conn = url.openConnection() as java.net.HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Content-Type", "application/json")
        conn.setRequestProperty("Authorization", "Bearer $apiKey")
        conn.doOutput = true
        conn.connectTimeout = 30000
        conn.readTimeout = 30000

        conn.outputStream.use { it.write(json.toJson(body).toByteArray()) }

        val responseCode = conn.responseCode
        if (responseCode !in 200..299) {
            val errorBody = conn.errorStream?.bufferedReader()?.readText() ?: ""
            throw Exception("LLM API error: $responseCode - $errorBody")
        }

        return json.fromJson(
            conn.inputStream.bufferedReader().readText(),
            JsonObject::class.java
        )
    }
}