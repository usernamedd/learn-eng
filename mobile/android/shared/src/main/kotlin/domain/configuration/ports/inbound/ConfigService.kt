package shared.domain.configuration.ports.inbound

import shared.domain.configuration.entities.AppConfig
import shared.domain.configuration.entities.Language

/**
 * 配置服务入站端口
 * platform UI 调用此接口管理配置
 */
interface ConfigService {
    fun getTargetLanguage(): String
    fun setTargetLanguage(lang: String)
    fun getLlmProvider(): String
    fun setLlmProvider(provider: String)
    fun getLlmApiKey(provider: String): String?
    fun setLlmApiKey(provider: String, key: String)
    fun getLlmBaseUrl(provider: String): String?
    fun setLlmBaseUrl(provider: String, url: String)
    fun getAllConfig(): AppConfig
}