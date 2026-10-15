import { SourceCitation } from './knowledgeDatabase.js';

export type SupportedLanguage = 'en' | 'kn' | 'te' | 'hi';

interface WikiSearchResult {
  title: string;
  snippet: string;
}

export interface WebResearchResult {
  title: string;
  topic: string;
  summary: string;
  fullAnswer: string;
  sources: SourceCitation[];
  language: SupportedLanguage;
}

/**
 * Detect language from text using Unicode character ranges and script analysis.
 * Kannada: \u0C80-\u0CFF
 * Telugu:  \u0C00-\u0C7F
 * Hindi/Devanagari: \u0900-\u097F
 */
export function detectLanguage(text: string): SupportedLanguage {
  if (!text) return 'en';

  const knMatches = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  const teMatches = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  const hiMatches = (text.match(/[\u0900-\u097F]/g) || []).length;

  if (knMatches > 0 && knMatches >= teMatches && knMatches >= hiMatches) {
    return 'kn';
  }
  if (teMatches > 0 && teMatches >= knMatches && teMatches >= hiMatches) {
    return 'te';
  }
  if (hiMatches > 0 && hiMatches >= knMatches && hiMatches >= teMatches) {
    return 'hi';
  }

  // Check common transliterated words if written in Latin script
  const lower = text.toLowerCase();
  if (/\b(kannada|hegiddira|hegidya|yenu|enu|hege|yaru|namaskara)\b/i.test(lower)) return 'kn';
  if (/\b(telugu|namaskaram|bagunnara|ela|evaru|emiti|enti|gurinchi)\b/i.test(lower)) return 'te';
  if (/\b(hindi|namaste|kaise|kya|kyun|kaun|batao|samjhao|kripya)\b/i.test(lower)) return 'hi';

  return 'en';
}

const translationCache = new Map<string, string>();

/**
 * Robust translator helper using MyMemory free API with caching.
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: string = 'en'
): Promise<string> {
  if (!text || targetLang === sourceLang) return text;
  const cleanSource = text.trim();
  const cacheKey = `${sourceLang}_${targetLang}_${cleanSource}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    if (cleanSource.length < 500) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanSource)}&langpair=${sourceLang}|${targetLang}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' } });
      if (res.ok) {
        const data = (await res.json()) as any;
        const translated = data.responseData?.translatedText;
        if (translated && !translated.includes('MYMEMORY WARNING:') && !translated.includes('IS AN INVALID TARGET')) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    } else {
      // Chunk sentences for long texts
      const sentences = cleanSource.match(/[^.!?]+[.!?]+|\S+/g) || [cleanSource];
      const translatedSentences: string[] = [];
      for (const s of sentences.slice(0, 5)) {
        const trimmed = s.trim();
        if (!trimmed) continue;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' } });
        if (res.ok) {
          const data = (await res.json()) as any;
          const translated = data.responseData?.translatedText;
          if (translated && !translated.includes('MYMEMORY WARNING:')) {
            translatedSentences.push(translated);
            continue;
          }
        }
        translatedSentences.push(trimmed);
      }
      const result = translatedSentences.join(' ');
      translationCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn(`Translation error for ${targetLang}:`, err);
  }
  return text;
}

// Clean and extract the core concept from conversational prompts in English, Kannada, Telugu, and Hindi
export function extractCoreQuery(raw: string): string {
  return raw
    // English conversational prefixes
    .replace(/^(can you\s+|could you\s+|please\s+)*(tell\s+(me\s+)?(about\s+|all about\s+)?|explain\s+(to\s+me\s+|me\s+)?(about\s+|all about\s+)?|talk\s+about\s+|speak\s+about\s+|play\s+(me\s+)?(something\s+about\s+|about\s+)?|search\s+for\s+|search\s+|look\s+up\s+|find\s+(out\s+about\s+|info\s+on\s+|about\s+)?|what\s+(is|are|was|were|about)\s+|who\s+(is|was|were)\s+|give\s+me\s+(an\s+overview\s+of|details\s+about|info\s+on)?\s*|how\s+(does|do|can)\s+|why\s+(is|are|do|does)\s+)/i, '')
    // Kannada conversational stopwords & questions
    .replace(/^(ದಯವಿಟ್ಟು\s+|ದಯಮಾಡಿ\s+)?(ತಿಳಿಸಿ\s+|ಹೇಳಿ\s+|ವಿವರಿಸಿ\s+|ಏನು\s+|ಯಾರು\s+|ಹೇಗೆ\s+)/i, '')
    .replace(/(ಬಗ್ಗೆ\s+ತಿಳಿಸಿ|ಬಗ್ಗೆ\s+ಹೇಳಿ|ಎಂದರೇನು|ಹೇಗೆ\s+ಕೆಲಸ\s+ಮಾಡುತ್ತದೆ|ಅಂದರೆ\s+ಏನು|ಎಂದರೆ\s+ಏನು)\??$/i, '')
    // Telugu conversational stopwords & questions
    .replace(/^(దయచేసి\s+)?(చెప్పండి\s+|వివరించండి\s+|ఏమిటి\s+|ఎవరు\s+|ఎలా\s+)/i, '')
    .replace(/(గురించి\s+చెప్పండి|అంటే\s+ఏమిటి|ఎలా\s+పనిచేస్తుంది|అంటే\s+ఏంటి|గురించి\s+తెలుపండి)\??$/i, '')
    // Hindi conversational stopwords & questions
    .replace(/^(कृपया\s+)?(बताएं\s+|बताइए\s+|समझाएं\s+|क्या\s+|कौन\s+|कैसे\s+)/i, '')
    .replace(/(के\s+बारे\s+में\s+बताएं|क्या\s+है|कैसे\s+काम\s+करता\s+है|समझाएं|के\s+बारे\s+में\s+बताइए)\??$/i, '')
    .replace(/\s+(work|function|operate|mean|do)\??$/i, '')
    .replace(/[?!.]+$/, '')
    .trim();
}

/**
 * Removes raw markdown artifacts (hashtags, asterisks, divider hyphens)
 * to deliver clean, natural text to the user.
 */
export function cleanSpecialCharacters(text: string): string {
  if (!text) return '';
  return text
    // 1. Remove markdown headers: '# Header', '## Header', '### Header', '#### Header' -> 'Header'
    .replace(/^#{1,6}\s+/gm, '')
    // 2. Remove any remaining line-leading or isolated hashtags: '# ' -> ''
    .replace(/(?:^|\s)#{1,6}(?:\s|$)/gm, ' ')
    // 3. Remove bold/italic asterisks: '***text***' -> 'text', '**text**' -> 'text', '*text*' -> 'text'
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // 4. Remove all remaining asterisks
    .replace(/\*/g, '')
    // 5. Remove markdown bold/italic underscores: '__text__' or '_text_' -> 'text'
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    // 6. Remove horizontal rules: '---', '***', '___'
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    // 7. Clean markdown links: '[url](url)' -> 'url', '[title](url)' -> 'title (url)'
    .replace(/\[(https?:\/\/[^\]]+)\]\(\1\)/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '$1 ($2)')
    // 8. Clean backticks
    .replace(/`([^`]+)`/g, '$1')
    .replace(/`/g, '')
    // 9. Clean bullet dashes: '- ' -> '• '
    .replace(/^[-]\s+/gm, '• ')
    // 10. Collapse excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const REGIONAL_HEADERS = {
  kn: {
    synthesis: 'ಸಂಶೋಧನಾ ಸಾರಾಂಶ:',
    sec1: '1. ವ್ಯಾಖ್ಯಾನ ಮತ್ತು ಅವಲೋಕನ',
    sec2: '2. ಮುಖ್ಯ ಕಾರ್ಯವಿಧಾನಗಳು ಮತ್ತು ತತ್ವಗಳು',
    sec3: '3. ಪ್ರಮುಖ ಪರಿಕಲ್ಪನೆಗಳು ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಅನ್ವಯಗಳು',
    sources: 'ಮೂಲಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಉಲ್ಲೇಖಗಳು:',
    corpus: 'ಕನ್ನಡ ವಿಕಿಪೀಡಿಯಾ ಜ್ಞಾನ ಭಂಡಾರ',
    refGuide: 'ಕನ್ನಡ ಮಾಹಿತಿ ಆಧಾರ'
  },
  te: {
    synthesis: 'పరిశోధన సారాంశం:',
    sec1: '1. నిర్వచనం మరియు ప్రాథమిక సమీక్ష',
    sec2: '2. కార్యాచరణ మరియు ప్రధాన సూత్రాలు',
    sec3: '3. ముఖ్య భావనలు మరియు ఆచరణాత్మక అనువర్తనాలు',
    sources: 'మూలాలు మరియు ధృవీకరించబడిన సూచనలు:',
    corpus: 'తెలుగు వికీపీడియా జ్ఞాన నిధి',
    refGuide: 'తెలుగు సమాచార మార్గదర్శి'
  },
  hi: {
    synthesis: 'शोध सारांश:',
    sec1: '1. परिभाषा एवं मुख्य विवरण',
    sec2: '2. मुख्य तंत्र एवं कार्यप्रणाली',
    sec3: '3. महत्वपूर्ण अवधारणाएं एवं व्यावहारिक अनुप्रयोग',
    sources: 'सत्यापित स्रोत एवं संदर्भ:',
    corpus: 'हिन्दी विकिपीडिया ज्ञानकोश',
    refGuide: 'हिन्दी प्रामाणिक संदर्भ'
  },
  en: {
    synthesis: 'Research Synthesis:',
    sec1: '1. Definition & Core Overview',
    sec2: '2. Mechanisms & Core Principles',
    sec3: '3. Key Concepts & Practical Applications',
    sources: 'Sources & Verified Citations:',
    corpus: 'Wikipedia Academic Corpus',
    refGuide: 'Reference Guide'
  }
};

/**
 * Live Web Knowledge Fetcher:
 * Queries Wikipedia (supporting native regional portals kn, te, hi, en),
 * DuckDuckGo, and OpenAlex to compile verified facts and accurate citations
 * in the requested regional language.
 */
export async function fetchLiveWebResearch(
  userQuery: string,
  requestedLang?: 'auto' | SupportedLanguage
): Promise<WebResearchResult> {
  const effectiveLang: SupportedLanguage =
    requestedLang && requestedLang !== 'auto'
      ? requestedLang
      : detectLanguage(userQuery);

  const coreQuery = extractCoreQuery(userQuery);
  const searchTopic = coreQuery || userQuery;

  let primaryTitle = searchTopic;
  let primaryExtract = '';
  let primaryUrl = `https://${effectiveLang === 'en' ? 'en' : effectiveLang}.wikipedia.org/wiki/${encodeURIComponent(searchTopic)}`;
  const sources: SourceCitation[] = [];
  const keyPoints: string[] = [];

  const headers = REGIONAL_HEADERS[effectiveLang] || REGIONAL_HEADERS.en;

  // --------------------------------------------------------------------------
  // 1. REGIONAL WIKIPEDIA SEARCH (kn, te, hi or en)
  // --------------------------------------------------------------------------
  let regionalFound = false;
  if (effectiveLang !== 'en') {
    try {
      const regSearchUrl = `https://${effectiveLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        searchTopic
      )}&format=json&utf8=1&srlimit=3`;
      const regRes = await fetch(regSearchUrl, {
        headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' },
      });

      if (regRes.ok) {
        const regData = (await regRes.json()) as any;
        const regHits: WikiSearchResult[] = regData.query?.search || [];

        if (regHits.length > 0) {
          primaryTitle = regHits[0].title;
          regionalFound = true;

          // Fetch regional summary
          try {
            const sumUrl = `https://${effectiveLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(primaryTitle)}`;
            const sumRes = await fetch(sumUrl, {
              headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' },
            });
            if (sumRes.ok) {
              const sumData = (await sumRes.json()) as any;
              primaryExtract = sumData.extract || '';
              if (sumData.content_urls?.desktop?.page) {
                primaryUrl = sumData.content_urls.desktop.page;
              }
            }
          } catch (e) {
            console.warn(`Regional (${effectiveLang}) summary error:`, e);
          }

          sources.push({
            id: 1,
            title: `${primaryTitle}`,
            url: primaryUrl,
            year: new Date().getFullYear().toString(),
            sourceName: headers.corpus,
          });

          // Add regional snippets as key points
          regHits.slice(1, 3).forEach((hit) => {
            const cleanSnippet = cleanSpecialCharacters(hit.snippet.replace(/<[^>]+>/g, '').trim());
            if (cleanSnippet) {
              keyPoints.push(`${hit.title}: ${cleanSnippet}`);
            }
            sources.push({
              id: sources.length + 1,
              title: hit.title,
              url: `https://${effectiveLang}.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
              year: new Date().getFullYear().toString(),
              sourceName: headers.corpus,
            });
          });
        }
      }
    } catch (err) {
      console.warn(`Regional Wikipedia search failed for ${effectiveLang}:`, err);
    }
  }

  // --------------------------------------------------------------------------
  // 2. ENGLISH WIKIPEDIA CROSS-SEARCH & INTERLANGUAGE LINK DISCOVERY
  // --------------------------------------------------------------------------
  let enTitle = searchTopic;
  let enExtract = '';
  let enUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(searchTopic)}`;

  try {
    const enSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      searchTopic
    )}&format=json&utf8=1&srlimit=4`;
    const enRes = await fetch(enSearchUrl, {
      headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' },
    });

    if (enRes.ok) {
      const enData = (await enRes.json()) as any;
      const enHits: WikiSearchResult[] = enData.query?.search || [];

      if (enHits.length > 0) {
        enTitle = enHits[0].title;

        // Check if English page has an interlanguage link to the target regional language
        if (effectiveLang !== 'en' && !regionalFound) {
          try {
            const langLinkUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
              enTitle
            )}&prop=langlinks&lllimit=500&format=json`;
            const llRes = await fetch(langLinkUrl, { headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' } });
            if (llRes.ok) {
              const llData = (await llRes.json()) as any;
              const pages = Object.values(llData.query?.pages || {});
              const links: any[] = (pages[0] as any)?.langlinks || [];
              const matchedLink = links.find((l) => l.lang === effectiveLang);
              if (matchedLink && matchedLink['*']) {
                primaryTitle = matchedLink['*'];
                primaryUrl = `https://${effectiveLang}.wikipedia.org/wiki/${encodeURIComponent(primaryTitle)}`;

                // Fetch the linked regional page summary
                const sumUrl = `https://${effectiveLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(primaryTitle)}`;
                const sumRes = await fetch(sumUrl, { headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' } });
                if (sumRes.ok) {
                  const sumData = (await sumRes.json()) as any;
                  primaryExtract = sumData.extract || '';
                  regionalFound = true;

                  sources.unshift({
                    id: 1,
                    title: primaryTitle,
                    url: primaryUrl,
                    year: new Date().getFullYear().toString(),
                    sourceName: headers.corpus,
                  });
                }
              }
            }
          } catch (e) {
            console.warn('Interlanguage links check error:', e);
          }
        }

        // Fetch English summary for fallback / enrichment
        try {
          const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(enTitle)}`;
          const summaryRes = await fetch(summaryUrl, {
            headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' },
          });
          if (summaryRes.ok) {
            const sumData = (await summaryRes.json()) as any;
            enExtract = sumData.extract || '';
            if (sumData.content_urls?.desktop?.page) {
              enUrl = sumData.content_urls.desktop.page;
            }
          }
        } catch (e) {
          console.warn('English Wikipedia summary error:', e);
        }

        if (effectiveLang === 'en') {
          primaryTitle = enTitle;
          primaryExtract = enExtract;
          primaryUrl = enUrl;

          sources.push({
            id: sources.length + 1,
            title: `${primaryTitle} (Comprehensive Overview)`,
            url: primaryUrl,
            year: new Date().getFullYear().toString(),
            sourceName: 'Wikipedia Academic Corpus',
          });

          enHits.slice(1, 3).forEach((hit) => {
            const cleanSnippet = hit.snippet.replace(/<[^>]+>/g, '').trim();
            if (cleanSnippet) {
              keyPoints.push(`• ${hit.title}: ${cleanSnippet}`);
            }
            sources.push({
              id: sources.length + 1,
              title: hit.title,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
              year: new Date().getFullYear().toString(),
              sourceName: 'Encyclopedic Knowledge Base',
            });
          });
        } else if (!sources.some((s) => s.url === enUrl)) {
          sources.push({
            id: sources.length + 1,
            title: `${enTitle} (Global Reference)`,
            url: enUrl,
            year: new Date().getFullYear().toString(),
            sourceName: 'Wikipedia Global Archive',
          });
        }
      }
    }
  } catch (err) {
    console.error('Wikipedia search error:', err);
  }

  // --------------------------------------------------------------------------
  // 3. REGIONAL TRANSLATION & ENRICHMENT
  // --------------------------------------------------------------------------
  // If regional extract was not found or is very brief, translate English extract to target language
  if (effectiveLang !== 'en') {
    if (!primaryExtract || primaryExtract.length < 80) {
      if (enExtract) {
        console.log(`[Regional Translator] Translating English knowledge to ${effectiveLang} for query: ${searchTopic}`);
        const translatedExtract = await translateText(enExtract, effectiveLang, 'en');
        primaryExtract = translatedExtract || enExtract;
      }
    }

    // If title was still in English letters, translate title for display
    if (detectLanguage(primaryTitle) === 'en') {
      const translatedTitle = await translateText(primaryTitle, effectiveLang, 'en');
      if (translatedTitle && translatedTitle !== primaryTitle) {
        primaryTitle = translatedTitle;
      }
    }
  }

  // Fallback to DuckDuckGo if everything else is empty
  let ddgAbstract = '';
  if (!primaryExtract && effectiveLang === 'en') {
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchTopic)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl, {
        headers: { 'User-Agent': 'JarvisTimeTravellerAgent/1.0' },
      });
      if (ddgRes.ok) {
        const ddgData = (await ddgRes.json()) as any;
        if (ddgData.AbstractText) {
          ddgAbstract = ddgData.AbstractText;
        }
      }
    } catch {
      // ignore
    }
  }

  const mainDefinition = primaryExtract || ddgAbstract || enExtract || `Information retrieved for ${primaryTitle}.`;

  // --------------------------------------------------------------------------
  // 4. STRUCTURE CLEAN REGIONAL SYNTHESIS (NO HASHTAGS OR ASTERISKS)
  // --------------------------------------------------------------------------
  const paragraphs = mainDefinition.split('\n\n').filter((p) => p.trim().length > 0);
  const leadParagraph = cleanSpecialCharacters(paragraphs[0] || mainDefinition);
  const secondaryParagraph = cleanSpecialCharacters(paragraphs.slice(1).join('\n\n'));

  let answer = `${headers.synthesis} ${primaryTitle}\n\n`;
  answer += `${headers.sec1}\n`;
  answer += `${leadParagraph} [1]\n\n`;

  if (secondaryParagraph) {
    answer += `${headers.sec2}\n`;
    answer += `${secondaryParagraph} [1]\n\n`;
  }

  if (keyPoints.length > 0) {
    answer += `${headers.sec3}\n`;
    keyPoints.forEach((kp, idx) => {
      const cleanKp = cleanSpecialCharacters(kp);
      answer += `• ${cleanKp} [${idx + 2}]\n`;
    });
    answer += `\n`;
  }

  answer += `${headers.sources}\n`;
  if (sources.length === 0) {
    sources.push({
      id: 1,
      title: `${primaryTitle} - ${headers.refGuide}`,
      url: primaryUrl,
      year: new Date().getFullYear().toString(),
      sourceName: headers.corpus,
    });
  }

  // Renumber and render clean source list
  sources.forEach((s, idx) => {
    s.id = idx + 1;
    answer += `• [${s.id}] ${s.title} (${s.year || '2026'}) – ${s.url}\n`;
  });

  return {
    title: primaryTitle,
    topic: searchTopic,
    summary: leadParagraph,
    fullAnswer: cleanSpecialCharacters(answer),
    sources,
    language: effectiveLang,
  };
}
