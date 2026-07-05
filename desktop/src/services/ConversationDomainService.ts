import { ChatHistory, type ChatMessage, type ChatResponse } from '../domain/conversation/entities';
import type { ConversationService } from '../domain/conversation/ports';
import type { LlmChatGateway, TtsGateway } from '../domain/conversation/ports';

const SYSTEM_PROMPT = `You are a helpful language learning assistant.
You are currently helping a user practice a foreign language.
Please respond in the target language the user is learning.
Keep your responses concise and educational.
When the user makes mistakes, you can gently correct them.`;

export class ConversationDomainService implements ConversationService {
  private history = new ChatHistory();

  constructor(
    private llmChatGateway: LlmChatGateway,
    private ttsGateway: TtsGateway
  ) {}

  async chat(userText: string, targetLanguage: string): Promise<ChatResponse> {
    const messages = [
      ...this.history.toList(),
      {
        id: crypto.randomUUID(),
        role: 'USER' as const,
        content: userText,
        timestamp: Date.now(),
      },
    ];

    const response = await this.llmChatGateway.chat(messages, SYSTEM_PROMPT);

    this.history.addUser(userText);
    this.history.addAssistant(response.message.content);

    // Play TTS in background (non-blocking)
    this.ttsGateway.speak(response.message.content, targetLanguage).catch(() => {});

    return response;
  }

  getHistory(): ChatMessage[] {
    return this.history.toList();
  }

  clearHistory(): void {
    this.history.clear();
  }
}
