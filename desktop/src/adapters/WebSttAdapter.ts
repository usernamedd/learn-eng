import type { SttGateway } from '../domain/conversation/ports';

/**
 * Web Speech API STT 适配器
 * 使用浏览器内置的 SpeechRecognition
 */
export class WebSttAdapter implements SttGateway {
  readonly provider = 'web';
  private recognition: SpeechRecognition | null = null;

  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  get isSupported(): boolean {
    return this.recognition !== null;
  }

  async recognize(audioData: ArrayBuffer, language: string): Promise<string> {
    // Web Speech API doesn't accept ArrayBuffer input,
    // it listens to the mic directly.
    // This method returns a placeholder; use startListening() instead.
    throw new Error(
      'Use startListening() for Web Speech API. recognize() is not supported.'
    );
  }

  /**
   * 开始语音识别（使用麦克风）
   * @returns 识别结果的文字
   */
  startListening(language: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('SpeechRecognition not supported'));
        return;
      }

      this.recognition.lang = this.langCodeToBcp47(language);

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // If onresult didn't fire, reject
        reject(new Error('Speech recognition ended without result'));
      };

      this.recognition.start();
    });
  }

  /** 停止监听 */
  stopListening(): void {
    this.recognition?.stop();
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
    return map[code] || 'zh-CN';
  }
}
