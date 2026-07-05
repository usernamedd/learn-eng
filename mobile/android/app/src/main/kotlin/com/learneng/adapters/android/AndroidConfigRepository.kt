package com.learneng.adapters.android

import android.content.Context
import com.google.gson.Gson
import shared.domain.configuration.entities.AppConfig
import shared.domain.configuration.ports.outbound.ConfigRepository

/**
 * Android 配置持久化适配器
 * 实现 Configuration 上下文的 ConfigRepository
 */
class AndroidConfigRepository(context: Context) : ConfigRepository {

    private val prefs = context.getSharedPreferences("learn_eng_config", Context.MODE_PRIVATE)
    private val gson = Gson()

    private val cachedConfig by lazy {
        val json = prefs.getString("app_config", null)
        if (json != null) {
            try { gson.fromJson(json, AppConfig::class.java) } catch (e: Exception) { AppConfig() }
        } else { AppConfig() }
    }

    override fun getConfig(): AppConfig = cachedConfig

    override fun saveConfig(cachedConfig: AppConfig) {
        prefs.edit().putString("app_config", gson.toJson(cachedConfig)).apply()
    }

    override fun getLlmApiKey(provider: String): String? = cachedConfig.llmApiKeys[provider]

    override fun setLlmApiKey(provider: String, key: String) {
        val updated = cachedConfig.copy(llmApiKeys = cachedConfig.llmApiKeys + (provider to key))
        saveConfig(updated)
    }

    override fun getLlmBaseUrl(provider: String): String? = cachedConfig.llmBaseUrls[provider]

    override fun setLlmBaseUrl(provider: String, url: String) {
        val updated = cachedConfig.copy(llmBaseUrls = cachedConfig.llmBaseUrls + (provider to url))
        saveConfig(updated)
    }

    override fun getTargetLanguage(): String = cachedConfig.targetLanguage

    override fun setTargetLanguage(lang: String) {
        val updated = cachedConfig.copy(targetLanguage = lang)
        saveConfig(updated)
    }

    override fun getLlmProvider(): String = cachedConfig.llmProvider

    override fun setLlmProvider(provider: String) {
        val updated = cachedConfig.copy(llmProvider = provider)
        saveConfig(updated)
    }
}
