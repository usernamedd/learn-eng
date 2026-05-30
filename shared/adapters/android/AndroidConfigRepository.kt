package shared.adapters.android

import shared.domain.configuration.entities.AppConfig
import shared.domain.configuration.ports.outbound.ConfigRepository

/**
 * Android 配置持久化适配器
 * 实现 Configuration 上下文的 ConfigRepository
 */
class AndroidConfigRepository : ConfigRepository {

    private val prefs = android.content.Context.getSharedPreferences("learn_eng_config", 0)
    private val gson = com.google.gson.Gson()

    private val config by lazy {
        val json = prefs.getString("app_config", null)
        if (json != null) {
            try { gson.fromJson(json, AppConfig::class.java) } catch (e: Exception) { AppConfig() }
        } else { AppConfig() }
    }

    override fun getConfig(): AppConfig = config

    override fun saveConfig(config: AppConfig) {
        prefs.edit().putString("app_config", gson.toJson(config)).apply()
    }

    override fun getLlmApiKey(provider: String): String? = config.llmApiKeys[provider]

    override fun setLlmApiKey(provider: String, key: String) {
        val updated = config.copy(llmApiKeys = config.llmApiKeys + (provider to key))
        saveConfig(updated)
    }

    override fun getLlmBaseUrl(provider: String): String? = config.llmBaseUrls[provider]

    override fun setLlmBaseUrl(provider: String, url: String) {
        val updated = config.copy(llmBaseUrls = config.llmBaseUrls + (provider to url))
        saveConfig(updated)
    }

    override fun getTargetLanguage(): String = config.targetLanguage

    override fun setTargetLanguage(lang: String) {
        val updated = config.copy(targetLanguage = lang)
        saveConfig(updated)
    }

    override fun getLlmProvider(): String = config.llmProvider

    override fun setLlmProvider(provider: String) {
        val updated = config.copy(llmProvider = provider)
        saveConfig(updated)
    }
}