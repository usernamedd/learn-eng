package shared.domain.translation.services

import shared.domain.translation.entities.TranslationResult
import shared.domain.translation.ports.inbound.TranslationService
import shared.domain.translation.ports.outbound.LlmGateway

/**
 * 翻译领域服务
 * Translation 上下文的核心服务实现
 */
class TranslationDomainService(
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