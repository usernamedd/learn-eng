import type { AppConfig } from '../domain/configuration/entities';
import { DEFAULT_CONFIG } from '../domain/configuration/entities';
import type { ConfigRepository } from '../domain/configuration/ports';

const STORAGE_KEY = 'learn_eng_config';

/**
 * localStorage 配置持久化适配器
 */
export class LocalConfigRepository implements ConfigRepository {
  private config: AppConfig;

  constructor() {
    this.config = this.load();
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  saveConfig(config: AppConfig): void {
    this.config = { ...config };
    this.persist();
  }

  getLlmApiKey(provider: string): string | undefined {
    return this.config.llmApiKeys[provider];
  }

  setLlmApiKey(provider: string, key: string): void {
    this.config = {
      ...this.config,
      llmApiKeys: { ...this.config.llmApiKeys, [provider]: key },
    };
    this.persist();
  }

  getLlmBaseUrl(provider: string): string | undefined {
    return this.config.llmBaseUrls[provider];
  }

  setLlmBaseUrl(provider: string, url: string): void {
    this.config = {
      ...this.config,
      llmBaseUrls: { ...this.config.llmBaseUrls, [provider]: url },
    };
    this.persist();
  }

  getTargetLanguage(): string {
    return this.config.targetLanguage;
  }

  setTargetLanguage(lang: string): void {
    this.config = { ...this.config, targetLanguage: lang };
    this.persist();
  }

  getLlmProvider(): string {
    return this.config.llmProvider;
  }

  setLlmProvider(provider: string): void {
    this.config = { ...this.config, llmProvider: provider };
    this.persist();
  }

  private load(): AppConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as AppConfig;
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_CONFIG };
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // ignore storage errors
    }
  }
}
