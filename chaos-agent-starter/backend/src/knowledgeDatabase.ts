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
  provider: 'live-web-search' | 'cached-web-vault' | 'ai-synthesized';
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
    .replace(/^(can you\s+)?(please\s+)?(explain|tell me about|what is|what are|who is|who was|describe|how do|how does|why is|why are|give me an overview of|search for|research)\s+(about\s+)?/i, '')
    .replace(/[^\w\s]/gi, '')
    .trim();
}

// Look up knowledge from the database
export function findKnowledge(query: string): KnowledgeEntry | null {
  const norm = normalizeQueryKey(query);
  if (!norm) return null;

  const entries = getAllKnowledge();
  // Exact normalized match or strong substring match
  const match = entries.find(
    (e) => e.normalizedKey === norm || norm.includes(e.normalizedKey) || e.normalizedKey.includes(norm)
  );

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
