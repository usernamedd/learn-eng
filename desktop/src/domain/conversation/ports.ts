import type { ChatMessage, ChatResponse } from './entities';

/** 入站端口：由 UI 层调用 */
export interface ConversationService {
  chat(userText: string, targetLanguage: string): Promise<ChatResponse>;
  getHistory(): ChatMessage[];
  clearHistory(): void;
}

/** LLM 对话出站端口 */
export interface LlmChatGateway {
  readonly provider: string;
  chat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<ChatResponse>;
}

/** TTS 出站端口 */
export interface TtsGateway {
  readonly provider: string;
  speak(text: string, language: string): Promise<ArrayBuffer>;
}

/** STT 出站端口 */
export interface SttGateway {
  readonly provider: string;
  recognize(audioData: ArrayBuffer, language: string): Promise<string>;
}
