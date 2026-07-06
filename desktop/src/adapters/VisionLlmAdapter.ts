import type { LearningCard } from '../domain/screenshot/entities';
import type { VisionLlmGateway } from '../domain/screenshot/ports';

interface ChatCompletionMessage {
  role: string;
  content:
    | string
    | {
        type: 'text' | 'image_url';
        text?: string;
        image_url?: { url: string };
      }[];
}

interface ChatCompletionResponse {
  choices: { message: ChatCompletionMessage }[];
}

const ANALYSIS_PROMPT = `You are a language learning assistant. Given two screenshots:

**Screenshot 1 (Context)**: The user's current screen showing the context where the target word appears.
**Screenshot 2 (Target)**: A close-up of the specific word/expression the user doesn't understand.

Please analyze and return a JSON object (ONLY valid JSON, no markdown wrapping):

{
  "targetWord": "the target word or expression",
  "contextualMeaning": "what this word means in this specific context, not dictionary definition",
  "chineseTranslation": "Chinese translation of the word/phrase",
  "wordChoiceAnalysis": {
    "reason": "why this word (not its synonyms) is used here",
    "nuance": "what tone/style it emphasizes",
    "vsAlternatives": ["alternative1: diff", "alternative2: diff"]
  },
  "similarUsages": [
    {"phrase": "similar phrase 1", "meaning": "Chinese meaning"},
    {"phrase": "similar phrase 2", "meaning": "Chinese meaning"}
  ],
  "pronunciation": {
    "phonetic": "IPA phonetic notation"
  },
  "sourceSentence": {
    "sentence": "the exact sentence containing the target word",
    "highlight": "the target word itself"
  },
  "metadata": {
    "partOfSpeech": "part of speech in English (e.g. verb, noun, adj)",
    "frequency": "choose from: ⭐⭐⭐ 高频, ⭐⭐ 中频, ⭐ 低频",
    "category": "choose from: 📘 学术词汇, 💼 商务词汇, 📱 日常, 📰 新闻, 💻 技术"
  }
}

IMPORTANT: Return ONLY raw JSON. No markdown, no code fences, no explanations.`;

/**
 * Vision LLM 适配器
 * 支持 OpenAI 兼容格式的视觉模型（DeepSeek-vision, GPT-4V, Ollama LLaVA 等）
 */
export class VisionLlmAdapter implements VisionLlmGateway {
  constructor(
    private apiKey: string,
    private baseUrl: string,
    public readonly provider: string
  ) {}

  async analyzeScreenshots(
    contextBase64: string,
    targetBase64: string,
    targetLanguage: string
  ): Promise<LearningCard> {
    const langInstruction = `The target language being learned is: ${targetLanguage}. Provide explanations accordingly.`;

    const body = {
      model: this.getModelName(),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: ANALYSIS_PROMPT + '\n\n' + langInstruction },
            {
              type: 'image_url',
              image_url: { url: contextBase64 },
            },
            {
              type: 'image_url',
              image_url: { url: targetBase64 },
            },
          ],
        },
      ],
      stream: false,
      response_format: { type: 'json_object' },
    };

    const data = await this.sendRequest<ChatCompletionResponse>(
      '/chat/completions',
      body
    );

    const raw = data.choices[0]?.message?.content ?? '';
    const parsed = this.parseResponse(raw);

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...parsed,
      bookmarked: false,
      contextScreenshot: { dataUrl: contextBase64, name: '上下文截图' },
      targetScreenshot: { dataUrl: targetBase64, name: '目标词截图' },
    };
  }

  private getModelName(): string {
    const models: Record<string, string> = {
      deepseek: 'deepseek-chat',
      openai: 'gpt-4o',
      ollama: 'llava',
      gemini: 'gemini-2.0-flash',
      claude: 'claude-3-sonnet',
      vllm: '',
    };
    return models[this.provider] || 'gpt-4o';
  }

  private parseResponse(raw: string): Omit<
    LearningCard,
    'id' | 'timestamp' | 'bookmarked' | 'contextScreenshot' | 'targetScreenshot'
  > {
    try {
      // Try parsing JSON directly
      const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      // Fallback: extract JSON from response
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          // ignore
        }
      }
      throw new Error('Failed to parse LLM vision response: ' + raw.slice(0, 200));
    }
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
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vision LLM API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}
