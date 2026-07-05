package shared.domain.configuration.ports.outbound

import shared.domain.configuration.entities.AppConfig

/**
 * 配置持久化出站端口
 * Configuration 上下文定义，adapters 实现
 */
interface ConfigRepository {
    fun getConfig(): AppConfig
    fun saveConfig(config: AppConfig)
    fun getLlmApiKey(provider: String): String?
    fun setLlmApiKey(provider: String, key: String)
    fun getLlmBaseUrl(provider: String): String?
    fun setLlmBaseUrl(provider: String, url: String)
    fun getTargetLanguage(): String
    fun setTargetLanguage(lang: String)
    fun getLlmProvider(): String
    fun setLlmProvider(provider: String)
}