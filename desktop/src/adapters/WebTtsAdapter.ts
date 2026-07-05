import type { TtsGateway } from '../domain/conversation/ports';

/**
 * Web Speech API TTS 适配器
 * 使用浏览器内置的 SpeechSynthesis
 */
export class WebTtsAdapter implements TtsGateway {
  readonly provider = 'web';

  async speak(text: string, language: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('SpeechSynthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.langCodeToBcp47(language);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // For streaming TTS, we just resolve with empty buffer
      // since Web Speech API plays directly
      utterance.onend = () => resolve(new ArrayBuffer(0));
      utterance.onerror = (e) => reject(e);

      window.speechSynthesis.speak(utterance);
    });
  }

  /** 播放文字（直接播放，不返回音频数据） */
  play(text: string, language: string): void {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.langCodeToBcp47(language);
    window.speechSynthesis.speak(utterance);
  }

  /** 停止播放 */
  stop(): void {
    window.speechSynthesis.cancel();
  }

  private langCodeToBcp47(code: string): string {
    const map: Record<string, string> = {
      en: 'en-US',
      ja: 'ja-JP',
      ko: 'ko-KR',
      de: 'de-DE',
      fr: 'fr-FR',
      es: 'es-ES',
      zh: 'zh-CN',
    };
    return map[code] || 'en-US';
  }
}
