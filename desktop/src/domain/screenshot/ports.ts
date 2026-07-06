import type { LearningCard, ScreenshotLearningRequest, WordBookEntry } from './entities';

/** 入站端口：截图学习服务，由 UI 层调用 */
export interface ScreenshotService {
  learn(request: ScreenshotLearningRequest, targetLanguage: string): Promise<LearningCard>;
}

/** 出站端口：视觉 LLM 网关 */
export interface VisionLlmGateway {
  readonly provider: string;
  analyzeScreenshots(
    contextBase64: string,
    targetBase64: string,
    targetLanguage: string
  ): Promise<LearningCard>;
}

/** 出站端口：生词本存储 */
export interface VocabularyRepository {
  save(entry: WordBookEntry): void;
  getAll(): WordBookEntry[];
  getById(id: string): WordBookEntry | undefined;
  delete(id: string): void;
  update(entry: WordBookEntry): void;
}
