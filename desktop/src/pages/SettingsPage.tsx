import { useState, useEffect } from 'react';
import { useAppServices } from '../AppContext';
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_PROVIDERS,
} from '../domain/configuration/entities';

export default function SettingsPage() {
  const { configService } = useAppServices();
  const config = configService.getAllConfig();

  const [targetLanguage, setTargetLanguage] = useState(config.targetLanguage);
  const [llmProvider, setLlmProvider] = useState(config.llmProvider);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    ...config.llmApiKeys,
  });
  const [baseUrls, setBaseUrls] = useState<Record<string, string>>({
    ...config.llmBaseUrls,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = configService.getAllConfig();
    setTargetLanguage(c.targetLanguage);
    setLlmProvider(c.llmProvider);
    setApiKeys({ ...c.llmApiKeys });
    setBaseUrls({ ...c.llmBaseUrls });
  }, [configService]);

  const handleSave = () => {
    configService.setTargetLanguage(targetLanguage);
    configService.setLlmProvider(llmProvider);

    // Save API key for current provider
    if (apiKeys[llmProvider]) {
      configService.setLlmApiKey(llmProvider, apiKeys[llmProvider]);
    }

    // Save base URL for current provider if set
    if (baseUrls[llmProvider]) {
      configService.setLlmBaseUrl(llmProvider, baseUrls[llmProvider]);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentProvider = SUPPORTED_PROVIDERS.find(
    (p) => p.id === llmProvider
  );
  const defaultBaseUrl =
    llmProvider === 'ollama'
      ? 'http://localhost:11434/v1'
      : llmProvider === 'vllm'
        ? 'http://localhost:8000/v1'
        : '';

  return (
    <div className="page settings-page">
      <h2>⚙️ 设置</h2>

      <div className="settings-section">
        <h3>🎯 目标语言</h3>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="settings-select"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-section">
        <h3>🤖 AI 模型</h3>
        <label>提供商</label>
        <select
          value={llmProvider}
          onChange={(e) => setLlmProvider(e.target.value)}
          className="settings-select"
        >
          {SUPPORTED_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.defaultModel || '自定义模型'})
            </option>
          ))}
        </select>

        <label>API Key</label>
        <input
          type="password"
          value={apiKeys[llmProvider] || ''}
          onChange={(e) =>
            setApiKeys((prev) => ({ ...prev, [llmProvider]: e.target.value }))
          }
          placeholder={`输入 ${currentProvider?.name || ''} API Key`}
          className="settings-input"
        />

        {currentProvider?.needsBaseUrl && (
          <>
            <label>Base URL</label>
            <input
              type="text"
              value={baseUrls[llmProvider] || defaultBaseUrl}
              onChange={(e) =>
                setBaseUrls((prev) => ({
                  ...prev,
                  [llmProvider]: e.target.value,
                }))
              }
              placeholder={defaultBaseUrl || 'https://api.example.com/v1'}
              className="settings-input"
            />
          </>
        )}
      </div>

      <button onClick={handleSave} className="btn btn-primary btn-save">
        {saved ? '✅ 已保存' : '💾 保存配置'}
      </button>
    </div>
  );
}
