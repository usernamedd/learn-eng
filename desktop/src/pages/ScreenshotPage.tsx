import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppServices } from '../AppContext';
import { VisionLlmAdapter } from '../adapters/VisionLlmAdapter';
import { ScreenshotLearningDomainService } from '../services/ScreenshotLearningDomainService';
import LearningCardComponent from '../components/LearningCardComponent';
import type { LearningCard, ScreenshotImage } from '../domain/screenshot/entities';
import type { WordBookEntry } from '../domain/screenshot/entities';
import { LocalVocabularyRepository } from '../adapters/LocalVocabularyRepository';

type CaptureStep = 'context' | 'target' | 'preview' | 'analyzing' | 'result';

interface CropState {
  fullImage: string;
  target: 'context' | 'target';
}

interface SelectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ScreenshotPage() {
  const { configService, ttsAdapter } = useAppServices();
  const [contextImage, setContextImage] = useState<ScreenshotImage | null>(null);
  const [targetImage, setTargetImage] = useState<ScreenshotImage | null>(null);
  const [step, setStep] = useState<CaptureStep>('context');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<LearningCard | null>(null);

  // Crop state
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

  const vocabRepo = useRef(new LocalVocabularyRepository()).current;
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const targetLang = configService.getTargetLanguage();

  // ============================================
  // Native Screenshot
  // ============================================

  const handleNativeScreenshot = useCallback(async (target: 'context' | 'target') => {
    try {
      setError('');
      // @ts-expect-error - Tauri invoke is available at runtime
      const b64 = await window.__TAURI_INTERNALS__.invoke('capture_screen');
      setCropState({ fullImage: `data:image/png;base64,${b64}`, target });
      setSelection(null);
    } catch (err) {
      setError(`截图失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  }, []);

  // ============================================
  // Crop Logic
  // ============================================

  const handleCropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cropContainerRef.current) return;
      const rect = cropContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setIsDrawing(true);
      setDrawStart({ x, y });
      setSelection({ x, y, w: 0, h: 0 });
    },
    []
  );

  const handleCropMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDrawing || !drawStart || !cropContainerRef.current) return;
      const rect = cropContainerRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const x = Math.min(drawStart.x, cx);
      const y = Math.min(drawStart.y, cy);
      const w = Math.abs(cx - drawStart.x);
      const h = Math.abs(cy - drawStart.y);

      setSelection({ x, y, w, h });
    },
    [isDrawing, drawStart]
  );

  const handleCropMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const confirmCrop = useCallback(() => {
    if (!cropState || !selection || selection.w < 10 || selection.h < 10) {
      setError('请拖动选择要截取的区域（至少 10x10 像素）');
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Calculate scale factor if image is displayed scaled
      const container = cropContainerRef.current;
      if (!container) return;
      const scaleX = img.naturalWidth / container.clientWidth;
      const scaleY = img.naturalHeight / container.clientHeight;

      const sx = selection.x * scaleX;
      const sy = selection.y * scaleY;
      const sw = selection.w * scaleX;
      const sh = selection.h * scaleY;

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const croppedDataUrl = canvas.toDataURL('image/png');

      const screenshot: ScreenshotImage = {
        dataUrl: croppedDataUrl,
        name: cropState.target === 'context' ? '上下文截图' : '目标词截图',
      };

      if (cropState.target === 'context') {
        setContextImage(screenshot);
        setStep('target');
      } else {
        setTargetImage(screenshot);
        setStep('preview');
      }

      setCropState(null);
      setSelection(null);
    };
    img.src = cropState.fullImage;
  }, [cropState, selection]);

  const cancelCrop = useCallback(() => {
    setCropState(null);
    setSelection(null);
    setIsDrawing(false);
    setDrawStart(null);
  }, []);

  // ============================================
  // Paste from clipboard
  // ============================================

  const handlePaste = useCallback(
    async (target: 'context' | 'target') => {
      try {
        setError('');
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const dataUrl = await blobToDataUrl(blob);
            const screenshot: ScreenshotImage = {
              dataUrl,
              name: target === 'context' ? '上下文截图' : '目标词截图',
            };
            if (target === 'context') {
              setContextImage(screenshot);
              setStep('target');
            } else {
              setTargetImage(screenshot);
              setStep('preview');
            }
            return;
          }
        }
        setError('剪贴板中没有图片');
      } catch (err) {
        setError(`读取剪贴板失败: ${err instanceof Error ? err.message : ''}`);
      }
    },
    []
  );

  // ============================================
  // Drag & Drop
  // ============================================

  const handleDrop = useCallback(
    (e: React.DragEvent, target: 'context' | 'target') => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const screenshot: ScreenshotImage = {
            dataUrl: reader.result as string,
            name: target === 'context' ? '上下文截图' : '目标词截图',
          };
          if (target === 'context') {
            setContextImage(screenshot);
            setStep('target');
          } else {
            setTargetImage(screenshot);
            setStep('preview');
          }
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Global paste listener
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      if (step === 'context') {
        handlePaste('context');
      } else if (step === 'target') {
        handlePaste('target');
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [step, handlePaste]);

  // ============================================
  // Analyze
  // ============================================

  const handleAnalyze = useCallback(async () => {
    if (!contextImage || !targetImage) return;
    setStep('analyzing');
    setLoading(true);
    setError('');

    try {
      const apiKey = configService.getLlmApiKey(configService.getLlmProvider());
      const baseUrl =
        configService.getLlmBaseUrl(configService.getLlmProvider()) ||
        'https://api.deepseek.com';
      const provider = configService.getLlmProvider();

      const visionAdapter = new VisionLlmAdapter(
        apiKey || '',
        baseUrl,
        provider
      );
      const service = new ScreenshotLearningDomainService(visionAdapter);

      const card = await service.learn(
        { contextScreenshot: contextImage, targetScreenshot: targetImage, targetLanguage: targetLang },
        targetLang
      );

      setResult(card);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  }, [contextImage, targetImage, targetLang, configService]);

  // ============================================
  // Bookmark
  // ============================================

  const handleBookmark = useCallback(
    (card: LearningCard) => {
      const entry: WordBookEntry = {
        id: card.id,
        savedAt: Date.now(),
        learningCard: card,
      };
      if (card.bookmarked) {
        vocabRepo.delete(card.id);
      } else {
        vocabRepo.save(entry);
      }
      setResult({ ...card, bookmarked: !card.bookmarked });
    },
    [vocabRepo]
  );

  // ============================================
  // Speaks
  // ============================================

  const handleSpeak = useCallback(
    (text: string) => {
      ttsAdapter.play(text, 'en');
    },
    [ttsAdapter]
  );

  // ============================================
  // Reset
  // ============================================

  const handleReset = useCallback(() => {
    setContextImage(null);
    setTargetImage(null);
    setStep('context');
    setResult(null);
    setError('');
  }, []);

  // ============================================
  // Render
  // ============================================

  // Crop overlay
  if (cropState) {
    return (
      <div className="page screenshot-page">
        <h2>📸 选择截图区域</h2>
        <p className="page-desc" style={{ marginBottom: 8 }}>
          {cropState.target === 'context'
            ? '拖动选择上下文区域（包含目标词出现的整体内容）'
            : '拖动选择要查询的目标词区域'}
        </p>
        <div className="crop-container" ref={cropContainerRef}>
          <img
            src={cropState.fullImage}
            alt="全屏截图"
            className="crop-image"
            draggable={false}
          />
          <div
            className="crop-overlay"
            onMouseDown={handleCropMouseDown}
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
          >
            {selection && selection.w > 0 && selection.h > 0 && (
              <div
                className="crop-selection"
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.w,
                  height: selection.h,
                }}
              />
            )}
          </div>
        </div>
        <div className="crop-actions">
          <button className="btn btn-primary" onClick={confirmCrop}>
            ✅ 确认选择
          </button>
          <button className="btn btn-voice" onClick={cancelCrop}>
            ❌ 取消
          </button>
        </div>
        <p className="crop-hint">
          💡 也可用 Ctrl+V 粘贴已截好的图片
        </p>
      </div>
    );
  }

  // Result view
  if (step === 'result' && result) {
    return (
      <div className="page screenshot-page">
        <div className="result-header">
          <h2>📖 学习结果</h2>
          <button className="btn btn-voice" onClick={handleReset}>
            🔄 再来一次
          </button>
        </div>
        <LearningCardComponent
          card={result}
          onBookmark={handleBookmark}
          onSpeak={handleSpeak}
        />
      </div>
    );
  }

  // Main view
  return (
    <div className="page screenshot-page">
      <h2>📸 截图学习</h2>
      <p className="page-desc">
        看到不认识的英语单词？截个图，一秒搞定
      </p>

      {/* Step indicator */}
      <div className="step-indicator">
        <div className={`step ${step === 'context' ? 'active' : contextImage ? 'done' : ''}`}>
          {contextImage ? '✅' : '①'} 上下文截图
        </div>
        <div className="step-arrow">→</div>
        <div className={`step ${step === 'target' ? 'active' : targetImage ? 'done' : ''}`}>
          {targetImage ? '✅' : '②'} 目标词截图
        </div>
        <div className="step-arrow">→</div>
        <div className={`step ${step === 'preview' || step === 'analyzing' || step === 'result' ? 'active' : ''}`}>
          {step === 'result' ? '✅' : '③'} 查看结果
        </div>
      </div>

      {/* Context screenshot area */}
      {step === 'context' && !contextImage && (
        <div className="capture-section">
          <h3>① 截图上下文内容</h3>
          <p className="section-desc">
            把你正在看的页面内容截下来（包含你不认识的单词所在的整体内容）
          </p>
          <div className="capture-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={() => handleNativeScreenshot('context')}
            >
              📷 屏幕截图
            </button>
          </div>
          <div className="input-methods">
            <button
              className="btn btn-voice"
              onClick={() => handlePaste('context')}
            >
              📋 Ctrl+V 粘贴
            </button>
            <div
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'context')}
            >
              或拖拽图片到这里
            </div>
          </div>
        </div>
      )}

      {/* Target screenshot area */}
      {step === 'target' && !targetImage && (
        <div className="capture-section">
          <h3>② 截图目标词</h3>
          <p className="section-desc">
            把你不会的那个单词/表达区域圈出来（特写）
          </p>
          <div className="capture-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={() => handleNativeScreenshot('target')}
            >
              📷 屏幕截图
            </button>
          </div>
          <div className="input-methods">
            <button
              className="btn btn-voice"
              onClick={() => handlePaste('target')}
            >
              📋 Ctrl+V 粘贴
            </button>
            <div
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'target')}
            >
              或拖拽图片到这里
            </div>
          </div>
          <button className="btn btn-voice" onClick={() => setStep('context')}>
            ← 重新截图上下文
          </button>
        </div>
      )}

      {/* Preview with both images */}
      {contextImage && targetImage && step === 'preview' && (
        <div className="preview-section">
          <h3>③ 预览并分析</h3>
          <div className="preview-images">
            <div className="preview-item">
              <label>📋 上下文截图</label>
              <img src={contextImage.dataUrl} alt="上下文" />
              <button
                className="btn btn-voice btn-sm"
                onClick={() => { setContextImage(null); setStep('context'); }}
              >
                重新截图
              </button>
            </div>
            <div className="preview-item">
              <label>🎯 目标词截图</label>
              <img src={targetImage.dataUrl} alt="目标词" />
              <button
                className="btn btn-voice btn-sm"
                onClick={() => { setTargetImage(null); setStep('target'); }}
              >
                重新截图
              </button>
            </div>
          </div>
          <button
            className="btn btn-primary btn-large"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? '⏳ AI 分析中...' : '🤖 AI 分析'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-section">
          <div className="spinner" />
          <p>AI 正在分析截图，请稍候...</p>
        </div>
      )}

      {/* Error */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
