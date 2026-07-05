import type { AppConfig } from '../domain/configuration/entities';
import type { ConfigService } from '../domain/configuration/ports';
import type { ConfigRepository } from '../domain/configuration/ports';

export class ConfigDomainService implements ConfigService {
  constructor(private configRepository: ConfigRepository) {}

  getTargetLanguage(): string {
    return this.configRepository.getTargetLanguage();
  }

  setTargetLanguage(lang: string): void {
    this.configRepository.setTargetLanguage(lang);
  }

  getLlmProvider(): string {
    return this.configRepository.getLlmProvider();
  }

  setLlmProvider(provider: string): void {
    this.configRepository.setLlmProvider(provider);
  }

  getLlmApiKey(provider: string): string | undefined {
    return this.configRepository.getLlmApiKey(provider);
  }

  setLlmApiKey(provider: string, key: string): void {
    this.configRepository.setLlmApiKey(provider, key);
  }

  getLlmBaseUrl(provider: string): string | undefined {
    return this.configRepository.getLlmBaseUrl(provider);
  }

  setLlmBaseUrl(provider: string, url: string): void {
    this.configRepository.setLlmBaseUrl(provider, url);
  }

  getAllConfig(): AppConfig {
    return this.configRepository.getConfig();
  }
}
