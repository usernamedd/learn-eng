import type { LearningCard } from '../domain/screenshot/entities';
import { useAppServices } from '../AppContext';

interface Props {
  card: LearningCard;
  onBookmark?: (card: LearningCard) => void;
  onSpeak?: (text: string) => void;
}

export default function LearningCardComponent({ card, onBookmark, onSpeak }: Props) {
  const { ttsAdapter } = useAppServices();
  const { targetWord, contextualMeaning, chineseTranslation } = card;
  const { phonetic } = card.pronunciation;
  const { sentence, highlight } = card.sourceSentence;
  const { reason, nuance, vsAlternatives } = card.wordChoiceAnalysis;
  const { partOfSpeech, frequency, category } = card.metadata;

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(targetWord);
    } else {
      ttsAdapter.play(targetWord, 'en');
    }
  };

  const handleBookmark = () => {
    if (onBookmark) onBookmark({ ...card, bookmarked: !card.bookmarked });
  };

  return (
    <div className="learning-card">
      {/* Header: word + pronunciation */}
      <div className="card-header">
        <div className="card-word-section">
          <h2 className="card-word">{targetWord}</h2>
          <div className="card-pronunciation">
            <span className="card-phonetic">{phonetic}</span>
            <button className="btn-icon" onClick={handleSpeak} title="朗读">
              🔊
            </button>
          </div>
        </div>
        <div className="card-tags">
          <span className="tag tag-pos">{partOfSpeech}</span>
          <span className="tag tag-frequency">{frequency}</span>
          <span className="tag tag-category">{category}</span>
        </div>
      </div>

      {/* ① 上下文释义 */}
      <div className="card-section">
        <div className="card-label">📖 上下文释义</div>
        <p className="card-text">{contextualMeaning}</p>
      </div>

      {/* ② 中文翻译 */}
      <div className="card-section">
        <div className="card-label">🇨🇳 中文对应说法</div>
        <p className="card-text chinese">{chineseTranslation}</p>
      </div>

      {/* ⑥ 原句提取 */}
      {sentence && (
        <div className="card-section">
          <div className="card-label">💬 原句</div>
          <blockquote className="card-sentence">
            {sentence.replace(
              highlight,
              `<mark>${highlight}</mark>`
            )}
          </blockquote>
        </div>
      )}

      {/* ③ 选词分析 */}
      <div className="card-section">
        <div className="card-label">💡 选词分析</div>
        <p className="card-text">{reason}</p>
        {nuance && <p className="card-nuance">{nuance}</p>}
        {vsAlternatives.length > 0 && (
          <div className="card-alternatives">
            <div className="card-sub-label">近义词对比</div>
            <ul>
              {vsAlternatives.map((alt, i) => (
                <li key={i}>{alt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ④ 类似用法 */}
      {card.similarUsages.length > 0 && (
        <div className="card-section">
          <div className="card-label">📝 类似用法</div>
          <div className="card-usages">
            {card.similarUsages.map((usage, i) => (
              <div key={i} className="card-usage-item">
                <code>{usage.phrase}</code>
                <span className="usage-meaning">{usage.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 截图预览 */}
      <div className="card-section card-screenshots">
        <div className="card-label">📸 截图</div>
        <div className="card-screenshot-previews">
          <div className="screenshot-thumb">
            <img src={card.contextScreenshot.dataUrl} alt="上下文截图" />
            <span>上下文</span>
          </div>
          <div className="screenshot-thumb">
            <img src={card.targetScreenshot.dataUrl} alt="目标词截图" />
            <span>目标</span>
          </div>
        </div>
      </div>

      {/* ⑧ 收藏按钮 */}
      <div className="card-actions">
        <button
          className={`btn btn-bookmark${card.bookmarked ? ' bookmarked' : ''}`}
          onClick={handleBookmark}
        >
          {card.bookmarked ? '⭐ 已收藏' : '☆ 收藏到生词本'}
        </button>
      </div>
    </div>
  );
}
