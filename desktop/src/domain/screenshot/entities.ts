/** 单张截图（base64 PNG 数据） */
export interface ScreenshotImage {
  dataUrl: string; // base64 data URL e.g. "data:image/png;base64,..."
  name: string;    // 用户可识别的名称
}

/** 截图学习请求：上下文截图 + 目标词截图 */
export interface ScreenshotLearningRequest {
  contextScreenshot: ScreenshotImage;
  targetScreenshot: ScreenshotImage;
  targetLanguage: string;
}

/** 选词分析 */
export interface WordChoiceAnalysis {
  reason: string;           // 为什么用这个词
  nuance: string;           // 语气/风格差异
  vsAlternatives: string[]; // 类似词辨析
}

/** 类似用法 */
export interface SimilarUsage {
  phrase: string;   // 类似短语
  meaning: string;  // 含义
}

/** 原句提取 */
export interface SourceSentence {
  sentence: string; // 原始语句
  highlight: string; // 高亮的目标词
}

/** 词性 + 常用度标签 */
export interface WordMetadata {
  partOfSpeech: string;     // 词性（如 verb / noun / adj）
  frequency: '⭐⭐⭐ 高频' | '⭐⭐ 中频' | '⭐ 低频';
  category: '📘 学术词汇' | '💼 商务词汇' | '📱 日常' | '📰 新闻' | '💻 技术';
}

/** 学习结果卡片（PRD 8 项内容） */
export interface LearningCard {
  id: string;
  timestamp: number;

  // ① 上下文释义
  contextualMeaning: string;
  // ② 中文对应说法
  chineseTranslation: string;
  // ③ 选词分析
  wordChoiceAnalysis: WordChoiceAnalysis;
  // ④ 类似用法
  similarUsages: SimilarUsage[];
  // ⑤ 发音
  pronunciation: {
    phonetic: string;   // 音标
  };
  // ⑥ 原句提取
  sourceSentence: SourceSentence;
  // ⑦ 词性 + 常用度标签
  metadata: WordMetadata;
  // ⑧ 一键收藏（标识位）
  bookmarked: boolean;

  // 额外：引用的截图
  contextScreenshot: ScreenshotImage;
  targetScreenshot: ScreenshotImage;

  // 目标词（提取的关键词）
  targetWord: string;
}

/** 生词本条目 */
export interface WordBookEntry {
  id: string;
  savedAt: number;
  learningCard: LearningCard;
  notes?: string;
}

/** 创建默认 LearningCard */
export function createEmptyLearningCard(): LearningCard {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    contextualMeaning: '',
    chineseTranslation: '',
    wordChoiceAnalysis: { reason: '', nuance: '', vsAlternatives: [] },
    similarUsages: [],
    pronunciation: { phonetic: '' },
    sourceSentence: { sentence: '', highlight: '' },
    metadata: { partOfSpeech: '', frequency: '⭐⭐ 中频', category: '📘 学术词汇' },
    bookmarked: false,
    contextScreenshot: { dataUrl: '', name: '' },
    targetScreenshot: { dataUrl: '', name: '' },
    targetWord: '',
  };
}
