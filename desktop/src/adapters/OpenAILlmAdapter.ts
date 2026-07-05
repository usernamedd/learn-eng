import type { TranslationResult } from '../domain/translation/entities';
import type { LlmGateway } from '../domain/translation/ports';
import type { ChatMessage, ChatResponse } from '../domain/conversation/entities';
import type { LlmChatGateway } from '../domain/conversation/ports';

interface ChatCompletionMessage {
  role: string;
  content: string;
}

interface ChatCompletionResponse {
  choices: { message: ChatCompletionMessage }[];
}

/**
 * OpenAI 兼容 API LLM 适配器
 * 同时实现 Translation 的 LlmGateway 和 Conversation 的 LlmChatGateway
 * 支持 DeepSeek / OpenAI / Ollama / vLLM 等
 */
export class OpenAILlmAdapter implements LlmGateway, LlmChatGateway {
  constructor(
    private apiKey: string,
    private baseUrl: string,
    public readonly provider: string
  ) {}

  // ===== LlmGateway (Translation) =====

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult> {
    const prompt =
      `Translate the following text from ${sourceLanguage} to ${targetLanguage}. ` +
      `Only output the translation, no explanations.\n\n${text}`;

    const body = {
      model: this.getModelName(),
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    };

    const data = await this.sendRequest<ChatCompletionResponse>(
      '/chat/completions',
      body
    );

    const translated = data.choices[0]?.message?.content ?? '';

    return {
      sourceText: text,
      translatedText: translated.trim(),
      sourceLanguage,
      targetLanguage,
    };
  }

  // ===== LlmChatGateway (Conversation) =====

  async chat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<ChatResponse> {
    const allMessages: ChatCompletionMessage[] = [];

    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      allMessages.push({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    const body = {
      model: this.getModelName(),
      messages: allMessages,
      stream: false,
    };

    const data = await this.sendRequest<ChatCompletionResponse>(
      '/chat/completions',
      body
    );

    const reply = data.choices[0]?.message?.content ?? '';

    return {
      message: {
        id: crypto.randomUUID(),
        role: 'ASSISTANT' as const,
        content: reply,
        timestamp: Date.now(),
      },
    };
  }

  // ===== Common =====

  private getModelName(): string {
    const models: Record<string, string> = {
      deepseek: 'deepseek-chat',
      openai: 'gpt-4',
      ollama: 'llama3',
      gemini: 'gemini-pro',
      claude: 'claude-3',
    };
    return models[this.provider] || 'gpt-4';
  }

  private async sendRequest<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, '')}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}
