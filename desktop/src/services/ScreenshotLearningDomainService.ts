import type { LearningCard, ScreenshotLearningRequest } from '../domain/screenshot/entities';
import type { ScreenshotService, VisionLlmGateway } from '../domain/screenshot/ports';

/**
 * 截图学习领域服务
 */
export class ScreenshotLearningDomainService implements ScreenshotService {
  constructor(private visionLlmGateway: VisionLlmGateway) {}

  async learn(
    request: ScreenshotLearningRequest,
    targetLanguage: string
  ): Promise<LearningCard> {
    const card = await this.visionLlmGateway.analyzeScreenshots(
      request.contextScreenshot.dataUrl,
      request.targetScreenshot.dataUrl,
      targetLanguage
    );
    return card;
  }
}
