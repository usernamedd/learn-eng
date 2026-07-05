import type { AppConfig } from './entities';

/** 入站端口：由 UI 层调用 */
export interface ConfigService {
  getTargetLanguage(): string;
  setTargetLanguage(lang: string): void;
  getLlmProvider(): string;
  setLlmProvider(provider: string): void;
  getLlmApiKey(provider: string): string | undefined;
  setLlmApiKey(provider: string, key: string): void;
  getLlmBaseUrl(provider: string): string | undefined;
  setLlmBaseUrl(provider: string, url: string): void;
  getAllConfig(): AppConfig;
}

/** 出站端口：由适配器实现 */
export interface ConfigRepository {
  getConfig(): AppConfig;
  saveConfig(config: AppConfig): void;
  getLlmApiKey(provider: string): string | undefined;
  setLlmApiKey(provider: string, key: string): void;
  getLlmBaseUrl(provider: string): string | undefined;
  setLlmBaseUrl(provider: string, url: string): void;
  getTargetLanguage(): string;
  setTargetLanguage(lang: string): void;
  getLlmProvider(): string;
  setLlmProvider(provider: string): void;
}
