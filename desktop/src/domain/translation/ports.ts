import type { TranslationResult } from './entities';

/** 入站端口：由 UI 层调用 */
export interface TranslationService {
  translate(text: string, targetLanguage: string): Promise<TranslationResult>;
}

/** 出站端口：由适配器实现 */
export interface LlmGateway {
  readonly provider: string;
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult>;
}
