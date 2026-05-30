package shared.domain.configuration.entities

/**
 * 应用配置
 */
data class AppConfig(
    val targetLanguage: String = "en",
    val llmProvider: String = "deepseek",
    val llmApiKeys: Map<String, String> = emptyMap(),
    val llmBaseUrls: Map<String, String> = emptyMap(),
    val ttsProvider: String = "system"
)

/**
 * 语言选项
 */
data class Language(
    val code: String,
    val name: String,
    val flag: String
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