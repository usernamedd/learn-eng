import { useState, useCallback } from 'react';
import { useAppServices } from '../AppContext';
import { OpenAILlmAdapter } from '../adapters/OpenAILlmAdapter';
import { TranslationDomainService } from '../services/TranslationDomainService';
import { WebSttAdapter } from '../adapters/WebSttAdapter';
import { SUPPORTED_LANGUAGES } from '../domain/configuration/entities';
import type { TranslationResult } from '../domain/translation/entities';

export default function TranslatePage() {
  const { configService, ttsAdapter } = useAppServices();
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);

  const sttAdapter = new WebSttAdapter();
  const targetLang = configService.getTargetLanguage();

  const createTranslationService = useCallback(() => {
    const apiKey = configService.getLlmApiKey(configService.getLlmProvider());
    const baseUrl =
      configService.getLlmBaseUrl(configService.getLlmProvider()) ||
      'https://api.deepseek.com';
    const provider = configService.getLlmProvider();
    const llmAdapter = new OpenAILlmAdapter(apiKey || '', baseUrl, provider);
    return new TranslationDomainService(llmAdapter);
  }, [configService]);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const service = createTranslationService();
      const translationResult = await service.translate(
        inputText.trim(),
        targetLang
      );
      setResult(translationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻译失败');
    } finally {
      setLoading(false);
    }
  }, [inputText, targetLang, createTranslationService]);

  const handleVoiceInput = useCallback(async () => {
    if (!sttAdapter.isSupported) {
      setError('浏览器不支持语音识别');
      return;
    }
    setListening(true);
    setError('');
    try {
      const text = await sttAdapter.startListening('zh');
      setInputText(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : '语音识别失败');
    } finally {
      setListening(false);
    }
  }, [sttAdapter]);

  const handleSpeak = useCallback(() => {
    if (result) {
      ttsAdapter.play(result.translatedText, result.targetLanguage);
    }
  }, [result, ttsAdapter]);

  const targetLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  return (
    <div className="page translate-page">
      <h2>🔤 翻译模式</h2>
      <p className="page-desc">
        说一句中文，翻译成 {targetLangInfo?.flag} {targetLangInfo?.name}
      </p>

      <div className="input-area">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入或语音输入中文..."
          rows={3}
          disabled={loading}
        />
        <div className="input-actions">
          <button
            onClick={handleVoiceInput}
            disabled={listening || loading}
            className={`btn btn-voice${listening ? ' listening' : ''}`}
          >
            {listening ? '🎤 聆听中...' : '🎤 语音输入'}
          </button>
          <button
            onClick={handleTranslate}
            disabled={!inputText.trim() || loading}
            className="btn btn-primary"
          >
            {loading ? '⏳ 翻译中...' : '🌐 翻译'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-area">
          <div className="result-item">
            <label>中文原文</label>
            <div className="result-text">{result.sourceText}</div>
          </div>
          <div className="result-item">
            <label>
              {targetLangInfo?.flag} {targetLangInfo?.name}
            </label>
            <div className="result-text translation">{result.translatedText}</div>
          </div>
          <button onClick={handleSpeak} className="btn btn-tts">
            🔊 朗读译文
          </button>
        </div>
      )}
    </div>
  );
}
