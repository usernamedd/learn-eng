import type { TranslationResult } from '../domain/translation/entities';
import type { TranslationService } from '../domain/translation/ports';
import type { LlmGateway } from '../domain/translation/ports';

export class TranslationDomainService implements TranslationService {
  constructor(private llmGateway: LlmGateway) {}

  async translate(
    text: string,
    targetLanguage: string
  ): Promise<TranslationResult> {
    return this.llmGateway.translate(text, 'zh', targetLanguage);
  }
}
