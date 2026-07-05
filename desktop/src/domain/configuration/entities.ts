/** 语言选项 */
export interface Language {
  code: string;
  name: string;
  flag: string;
}

/** 内置支持的语言 */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

/** LLM 提供商 */
export interface LlmProvider {
  id: string;
  name: string;
  defaultModel: string;
  needsBaseUrl: boolean;
}

export const SUPPORTED_PROVIDERS: LlmProvider[] = [
  { id: 'deepseek', name: 'DeepSeek', defaultModel: 'deepseek-chat', needsBaseUrl: false },
  { id: 'openai', name: 'OpenAI', defaultModel: 'gpt-4', needsBaseUrl: false },
  { id: 'claude', name: 'Claude', defaultModel: 'claude-3', needsBaseUrl: false },
  { id: 'gemini', name: 'Gemini', defaultModel: 'gemini-pro', needsBaseUrl: false },
  { id: 'ollama', name: 'Ollama', defaultModel: 'llama3', needsBaseUrl: true },
  { id: 'vllm', name: 'vLLM', defaultModel: '', needsBaseUrl: true },
];

/** 应用配置 */
export interface AppConfig {
  targetLanguage: string;
  llmProvider: string;
  llmApiKeys: Record<string, string>;
  llmBaseUrls: Record<string, string>;
  ttsProvider: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  targetLanguage: 'en',
  llmProvider: 'deepseek',
  llmApiKeys: {},
  llmBaseUrls: {},
  ttsProvider: 'web',
};
