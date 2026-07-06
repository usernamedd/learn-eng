import type { WordBookEntry } from '../domain/screenshot/entities';
import type { VocabularyRepository } from '../domain/screenshot/ports';

const STORAGE_KEY = 'learn-eng-vocabulary';

/**
 * localStorage 实现的生词本仓库
 */
export class LocalVocabularyRepository implements VocabularyRepository {
  private getAllRaw(): WordBookEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveAll(entries: WordBookEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  save(entry: WordBookEntry): void {
    const entries = this.getAllRaw();
    entries.unshift(entry); // newest first
    this.saveAll(entries);
  }

  getAll(): WordBookEntry[] {
    return this.getAllRaw();
  }

  getById(id: string): WordBookEntry | undefined {
    return this.getAllRaw().find((e) => e.id === id);
  }

  delete(id: string): void {
    const entries = this.getAllRaw().filter((e) => e.id !== id);
    this.saveAll(entries);
  }

  update(entry: WordBookEntry): void {
    const entries = this.getAllRaw().map((e) =>
      e.id === entry.id ? entry : e
    );
    this.saveAll(entries);
  }
}
