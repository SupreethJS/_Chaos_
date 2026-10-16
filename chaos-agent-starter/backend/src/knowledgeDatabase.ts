import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SourceCitation {
  id: number;
  title: string;
  url: string;
  year?: string;
  sourceName?: string;
}

export interface KnowledgeEntry {
  id: string;
  query: string;
  normalizedKey: string;
  topic: string;
  summary: string;
  fullAnswer: string;
  sources: SourceCitation[];
  provider: 'live-web-search' | 'cached-web-vault' | 'ai-synthesized' | 'sarvam-indic-ai';
  createdAt: string;
  updatedAt: string;
  hitCount: number;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'knowledge_vault.json');

// Ensure database directory and file exist
function ensureDbExists(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ version: '1.0', entries: [] }, null, 2), 'utf-8');
  }
}

// Read all entries from database
export function getAllKnowledge(): KnowledgeEntry[] {
  try {
    ensureDbExists();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data.entries) ? data.entries : [];
  } catch (err) {
    console.error('Error reading knowledge vault database:', err);
    return [];
  }
}

// Normalize a search string for indexing
export function normalizeQueryKey(query: string): string {
  return query
    .toLowerCase()
    .replace(/^(can you\s+|could you\s+|please\s+)*(tell\s+(me\s+)?(about\s+|all about\s+)?|explain\s+(to\s+me\s+|me\s+)?(about\s+|all about\s+)?|talk\s+about\s+|speak\s+about\s+|play\s+(me\s+)?(something\s+about\s+|about\s+)?|search\s+for\s+|search\s+|look\s+up\s+|find\s+(out\s+about\s+|info\s+on\s+|about\s+)?|what\s+(is|are|was|were|about)\s+|who\s+(is|was|were)\s+|give\s+me\s+(an\s+overview\s+of|details\s+about|info\s+on)?\s*|how\s+(does|do|can)\s+|why\s+(is|are|do|does)\s+)/i, '')
    .replace(/\s+(work|function|operate|mean|do)\??$/i, '')
    .replace(/[^\w\s]/gi, '')
    .trim();
}

// Look up knowledge from the database
export function findKnowledge(query: string): KnowledgeEntry | null {
  const norm = normalizeQueryKey(query);
  if (!norm || norm.length < 3) return null;

  const entries = getAllKnowledge();
  // Exact match first, or word-level inclusion if long enough
  const match = entries.find((e) => {
    if (e.normalizedKey === norm) return true;
    if (e.normalizedKey.length >= 4 && norm.length >= 4) {
      const eWords = e.normalizedKey.split(/\s+/);
      const nWords = norm.split(/\s+/);
      return eWords.every(w => nWords.includes(w)) || nWords.every(w => eWords.includes(w));
    }
    return false;
  });

  if (match) {
    // Increment hit count
    try {
      match.hitCount = (match.hitCount || 1) + 1;
      match.updatedAt = new Date().toISOString();
      saveKnowledge(match);
    } catch {
      // Ignore background hit update failures
    }
  }

  return match || null;
}

// Save or update knowledge in the database
export function saveKnowledge(entry: KnowledgeEntry): void {
  try {
    ensureDbExists();
    const entries = getAllKnowledge();
    const existingIndex = entries.findIndex((e) => e.id === entry.id || e.normalizedKey === entry.normalizedKey);

    if (existingIndex >= 0) {
      entries[existingIndex] = {
        ...entries[existingIndex],
        ...entry,
        hitCount: (entries[existingIndex].hitCount || 1) + 1,
        updatedAt: new Date().toISOString(),
      };
    } else {
      entries.unshift({
        ...entry,
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hitCount: entry.hitCount || 1,
      });
    }

    fs.writeFileSync(DB_FILE, JSON.stringify({ version: '1.0', updatedAt: new Date().toISOString(), entries }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to knowledge vault database:', err);
  }
}
