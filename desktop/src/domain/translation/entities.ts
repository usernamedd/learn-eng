/** 翻译请求 */
export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/** 翻译结果 */
export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export function createTranslationRequest(
  text: string,
  targetLanguage: string,
  sourceLanguage = 'zh'
): TranslationRequest {
  return { text, sourceLanguage, targetLanguage };
}
