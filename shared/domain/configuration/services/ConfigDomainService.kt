package shared.domain.configuration.services

import shared.domain.configuration.entities.AppConfig
import shared.domain.configuration.ports.inbound.ConfigService
import shared.domain.configuration.ports.outbound.ConfigRepository

/**
 * 配置领域服务
 * Configuration 上下文的核心服务实现
 */
class ConfigDomainService(
    private val configRepository: ConfigRepository
) : ConfigService {

    override fun getTargetLanguage(): String = configRepository.getTargetLanguage()

    override fun setTargetLanguage(lang: String) {
        configRepository.setTargetLanguage(lang)
    }

    override fun getLlmProvider(): String = configRepository.getLlmProvider()

    override fun setLlmProvider(provider: String) {
        configRepository.setLlmProvider(provider)
    }

    override fun getLlmApiKey(provider: String): String? = configRepository.getLlmApiKey(provider)

    override fun setLlmApiKey(provider: String, key: String) {
        configRepository.setLlmApiKey(provider, key)
    }

    override fun getLlmBaseUrl(provider: String): String? = configRepository.getLlmBaseUrl(provider)

    override fun setLlmBaseUrl(provider: String, url: String) {
        configRepository.setLlmBaseUrl(provider, url)
    }

    override fun getAllConfig(): AppConfig = configRepository.getConfig()
}