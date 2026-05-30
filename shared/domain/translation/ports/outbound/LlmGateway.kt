package shared.domain.translation.ports.outbound

import shared.domain.translation.entities.TranslationResult

/**
 * LLM 出站端口（翻译方法）
 * Translation 上下文定义，adapters 实现
 */
interface LlmGateway {
    val provider: String

    suspend fun translate(
        text: String,
        sourceLanguage: String,
        targetLanguage: String
    ): TranslationResult
}