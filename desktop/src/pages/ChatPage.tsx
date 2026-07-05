import { useState, useCallback, useRef } from 'react';
import { useAppServices } from '../AppContext';
import { OpenAILlmAdapter } from '../adapters/OpenAILlmAdapter';
import { ConversationDomainService } from '../services/ConversationDomainService';
import { WebSttAdapter } from '../adapters/WebSttAdapter';
import { SUPPORTED_LANGUAGES } from '../domain/configuration/entities';
import type { ChatMessage } from '../domain/conversation/entities';

export default function ChatPage() {
  const { configService, ttsAdapter } = useAppServices();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const convServiceRef = useRef<ConversationDomainService | null>(null);
  const sttAdapter = useRef(new WebSttAdapter()).current;
  const targetLang = configService.getTargetLanguage();

  const getConversationService = useCallback(() => {
    if (!convServiceRef.current) {
      const apiKey = configService.getLlmApiKey(configService.getLlmProvider());
      const baseUrl =
        configService.getLlmBaseUrl(configService.getLlmProvider()) ||
        'https://api.deepseek.com';
      const provider = configService.getLlmProvider();
      const llmAdapter = new OpenAILlmAdapter(apiKey || '', baseUrl, provider);
      convServiceRef.current = new ConversationDomainService(
        llmAdapter,
        ttsAdapter
      );
    }
    return convServiceRef.current;
  }, [configService, ttsAdapter]);

  const handleVoiceInput = useCallback(async () => {
    if (!sttAdapter.isSupported) {
      setError('浏览器不支持语音识别');
      return;
    }
    setListening(true);
    setError('');
    try {
      const text = await sttAdapter.startListening('zh');
      const service = getConversationService();

      // Add user message to UI
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'USER',
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      setLoading(true);
      const response = await service.chat(text, targetLang);
      setMessages((prev) => [...prev, response.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '对话失败');
    } finally {
      setLoading(false);
      setListening(false);
    }
  }, [targetLang, getConversationService, sttAdapter]);

  const handleClearHistory = useCallback(() => {
    getConversationService().clearHistory();
    setMessages([]);
  }, [getConversationService]);

  const handleSpeak = useCallback(
    (text: string) => {
      ttsAdapter.play(text, targetLang);
    },
    [ttsAdapter, targetLang]
  );

  const targetLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  return (
    <div className="page chat-page">
      <h2>💬 对话模式</h2>
      <p className="page-desc">
        用中文说话，AI 用 {targetLangInfo?.flag} {targetLangInfo?.name}{' '}
        回复你
      </p>

      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            点击下方按钮开始对话吧 🎤
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role === 'USER' ? 'user' : 'assistant'}`}
          >
            <div className="message-role">
              {msg.role === 'USER' ? '🙋 你' : `🤖 AI (${targetLangInfo?.flag})`}
              {msg.role === 'ASSISTANT' && (
                <button
                  className="btn-speak"
                  onClick={() => handleSpeak(msg.content)}
                  title="朗读"
                >
                  🔊
                </button>
              )}
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="message-role">🤖 AI</div>
            <div className="message-content thinking">思考中...</div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="chat-actions">
        <button
          onClick={handleVoiceInput}
          disabled={listening || loading}
          className={`btn btn-voice${listening ? ' listening' : ''}`}
        >
          {listening
            ? '🎤 聆听中...'
            : loading
              ? '⏳ 等待回复...'
              : '🎤 按住说话'}
        </button>
        {messages.length > 0 && (
          <button onClick={handleClearHistory} className="btn btn-clear">
            🗑️ 清空对话
          </button>
        )}
      </div>
    </div>
  );
}
