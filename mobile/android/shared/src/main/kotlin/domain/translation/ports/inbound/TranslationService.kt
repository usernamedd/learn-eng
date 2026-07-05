package shared.domain.translation.ports.inbound

import shared.domain.translation.entities.TranslationResult

/**
 * 翻译服务入站端口
 * platform UI 调用此接口使用翻译能力
 */
interface TranslationService {
    suspend fun translate(text: String, targetLanguage: String): TranslationResult
}