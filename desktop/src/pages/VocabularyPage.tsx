import { useState, useEffect, useCallback } from 'react';
import { LocalVocabularyRepository } from '../adapters/LocalVocabularyRepository';
import LearningCardComponent from '../components/LearningCardComponent';
import type { WordBookEntry } from '../domain/screenshot/entities';

export default function VocabularyPage() {
  const [entries, setEntries] = useState<WordBookEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const vocabRepo = new LocalVocabularyRepository();

  const refresh = useCallback(() => {
    setEntries(vocabRepo.getAll());
  }, [vocabRepo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = useCallback(
    (id: string) => {
      vocabRepo.delete(id);
      refresh();
    },
    [vocabRepo, refresh]
  );

  const handleBookmark = useCallback(
    (card: WordBookEntry['learningCard']) => {
      // Toggle bookmark = remove from vocabulary
      vocabRepo.delete(card.id);
      refresh();
    },
    [vocabRepo, refresh]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  if (entries.length === 0) {
    return (
      <div className="page vocabulary-page">
        <h2>📚 生词本</h2>
        <p className="page-desc">收藏的单词会出现在这里</p>
        <div className="vocab-empty">
          <p>还没有收藏任何单词</p>
          <p className="text-muted">截图学习后点击 ☆ 收藏，单词会自动保存到这里</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page vocabulary-page">
      <div className="vocab-header">
        <h2>📚 生词本</h2>
        <span className="vocab-count">共 {entries.length} 条</span>
      </div>

      <div className="vocab-list">
        {entries.map((entry) => (
          <div key={entry.id} className="vocab-item">
            <div
              className="vocab-item-header"
              onClick={() => toggleExpand(entry.id)}
            >
              <div className="vocab-word-info">
                <span className="vocab-word">{entry.learningCard.targetWord}</span>
                <span className="vocab-def">
                  {entry.learningCard.chineseTranslation}
                </span>
              </div>
              <div className="vocab-meta">
                <span className="vocab-time">
                  {formatDate(entry.savedAt)}
                </span>
                <span className="vocab-expand">
                  {expandedId === entry.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {expandedId === entry.id && (
              <div className="vocab-item-body">
                <LearningCardComponent
                  card={entry.learningCard}
                  onBookmark={handleBookmark}
                />
                <button
                  className="btn btn-clear btn-sm"
                  onClick={() => handleDelete(entry.id)}
                >
                  🗑️ 删除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
