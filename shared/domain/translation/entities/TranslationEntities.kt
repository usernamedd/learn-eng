package shared.domain.translation.entities

/**
 * 翻译请求
 */
data class TranslationRequest(
    val text: String,
    val sourceLanguage: String = "zh",
    val targetLanguage: String
)

/**
 * 翻译结果
 */
data class TranslationResult(
    val sourceText: String,
    val translatedText: String,
    val sourceLanguage: String,
    val targetLanguage: String
)