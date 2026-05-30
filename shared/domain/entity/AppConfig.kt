package shared.domain.entity

/**
 * 应用配置实体
 * @param targetLanguage 目标语言（默认 "en"）
 * @param llmProvider 当前 LLM 提供商
 * @param llmApiKeys 各提供商的 API Key
 * @param llmBaseUrls 自部署模型的地址
 * @param ttsProvider TTS 提供商
 */
data class AppConfig(
    val targetLanguage: String = "en",
    val llmProvider: String = "deepseek",
    val llmApiKeys: Map<String, String> = emptyMap(),
    val llmBaseUrls: Map<String, String> = emptyMap(),
    val ttsProvider: String = "system"
)

/**
 * 语言信息
 */
data class Language(
    val code: String,    // "en", "ja", "ko"...
    val name: String,    // "English", "日本語"...
    val flag: String      // "🇺🇸", "🇯🇵"...
) {
    companion object {
        val SUPPORTED = listOf(
            Language("en", "English", "🇺🇸"),
            Language("ja", "日本語", "🇯🇵"),
            Language("ko", "한국어", "🇰🇷"),
            Language("de", "Deutsch", "🇩🇪"),
            Language("fr", "Français", "🇫🇷"),
            Language("es", "Español", "🇪🇸"),
            Language("zh", "中文", "🇨🇳")
        )
    }
}