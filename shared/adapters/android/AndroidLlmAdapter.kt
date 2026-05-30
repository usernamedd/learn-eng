package shared.adapters.android

import shared.domain.entity.ChatMessage
import shared.domain.entity.ChatResponse
import shared.domain.entity.TranslationResult
import shared.ports.outbound.LlmGateway
import java.util.UUID

/**
 * Android LLM 适配器
 * 支持 OpenAI兼容 API（DeepSeek / GPT / Ollama / vLLM 等）
 */
class AndroidLlmAdapter(
    private val apiKey: String,
    private val baseUrl: String,
    override val provider: String
) : LlmGateway {

    private val json = com.google.gson.Gson()

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

    private fun getModelName(): String = when (provider) {
        "deepseek" -> "deepseek-chat"
        "openai" -> "gpt-4"
        "ollama" -> "llama3"
        else -> "gpt-4"
    }

    private fun sendRequest(endpoint: String, body: Map<String, Any?>): com.google.gson.JsonObject {
        val url = java.net.URL("$baseUrl$endpoint")
        val conn = url.openConnection() as java.net.HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Content-Type", "application/json")
        conn.setRequestProperty("Authorization", "Bearer $apiKey")
        conn.doOutput = true

        conn.outputStream.use { it.write(json.toJson(body).toByteArray()) }

        val responseCode = conn.responseCode
        if (responseCode !in 200..299) {
            val errorBody = conn.errorStream?.bufferedReader()?.readText() ?: ""
            throw Exception("LLM API error: $responseCode - $errorBody")
        }

        return json.fromJson(
            conn.inputStream.bufferedReader().readText(),
            com.google.gson.JsonObject::class.java
        )
    }
}