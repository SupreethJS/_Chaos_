import { cleanSpecialCharacters } from './webKnowledge.js';

export type RegionalLanguage = 'kn' | 'te' | 'hi' | 'en';

export interface SarvamConfig {
  configured: boolean;
  ttsModel: string;
  chatModel: string;
  speaker: string;
}

/**
 * Maps short language codes to Sarvam BCP-47 language codes
 */
export function getSarvamLanguageCode(lang: string): string {
  switch (lang.toLowerCase()) {
    case 'kn': return 'kn-IN';
    case 'te': return 'te-IN';
    case 'hi': return 'hi-IN';
    case 'en': return 'en-IN';
    case 'ta': return 'ta-IN';
    case 'bn': return 'bn-IN';
    case 'mr': return 'mr-IN';
    case 'gu': return 'gu-IN';
    case 'ml': return 'ml-IN';
    case 'pa': return 'pa-IN';
    case 'od': return 'od-IN';
    default: return 'hi-IN';
  }
}

/**
 * Returns user-facing regional language display title
 */
export function getRegionalLanguageName(lang: string): string {
  switch (lang.toLowerCase()) {
    case 'kn': return 'Kannada (ಕನ್ನಡ)';
    case 'te': return 'Telugu (తెలుగు)';
    case 'hi': return 'Hindi (हिन्दी)';
    case 'en': return 'English';
    default: return 'English';
  }
}

/**
 * Checks whether the user has supplied a valid SARVAM_API_KEY
 */
export function isSarvamConfigured(): boolean {
  const key = process.env.SARVAM_API_KEY;
  return Boolean(key && key.trim().length > 0 && key !== 'your_sarvam_api_key_here');
}

/**
 * Retrieves current Sarvam AI configuration parameters
 */
export function getSarvamConfig(): SarvamConfig {
  return {
    configured: isSarvamConfigured(),
    ttsModel: process.env.SARVAM_TTS_MODEL || 'bulbul:v3',
    chatModel: process.env.SARVAM_CHAT_MODEL || 'sarvam-105b',
    speaker: process.env.SARVAM_TTS_SPEAKER || 'shubh'
  };
}

/**
 * Synthesizes high-fidelity regional speech using Sarvam AI Bulbul TTS API
 * Supports Kannada (kn-IN), Telugu (te-IN), Hindi (hi-IN), and English (en-IN)
 * Returns a raw MP3 Buffer
 */
export async function synthesizeSarvamSpeech(
  text: string,
  lang: string,
  customSpeaker?: string
): Promise<Buffer | null> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_sarvam_api_key_here') {
    return null;
  }

  const cleanText = text
    .replace(/^#{1,6}\s+.*$/gim, '')
    .replace(/\[\d+\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_#•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return null;

  const sample = cleanText.slice(0, 1800);
  const languageCode = getSarvamLanguageCode(lang);
  const model = process.env.SARVAM_TTS_MODEL || 'bulbul:v3';
  const speaker = customSpeaker || process.env.SARVAM_TTS_SPEAKER || 'shubh';

  try {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey
      },
      body: JSON.stringify({
        text: sample,
        language_code: languageCode,
        model,
        speaker,
        speech_sample_rate: 22050,
        pace: 1.0,
        output_audio_codec: 'mp3',
        enable_preprocessing: true
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[Sarvam TTS API Error]: HTTP ${response.status}: ${errText}`);
      return null;
    }

    const data = (await response.json()) as { audios?: string[]; request_id?: string };
    const base64Audio = data.audios?.[0];

    if (!base64Audio) {
      console.warn('[Sarvam TTS]: No audio data returned in response payload');
      return null;
    }

    return Buffer.from(base64Audio, 'base64');
  } catch (err) {
    console.warn('[Sarvam TTS Error]: Speech synthesis request failed:', err);
    return null;
  }
}

/**
 * Translates and localizes text into natural regional Indic scripts
 * using Sarvam AI Mayura Translation API
 */
export async function translateWithSarvam(
  text: string,
  targetLang: string,
  sourceLang: string = 'auto'
): Promise<string | null> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_sarvam_api_key_here') {
    return null;
  }

  const cleanInput = text.trim();
  if (!cleanInput) return null;

  const targetCode = getSarvamLanguageCode(targetLang);
  const sourceCode = sourceLang === 'auto' ? 'auto' : getSarvamLanguageCode(sourceLang);

  try {
    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey
      },
      body: JSON.stringify({
        input: cleanInput.slice(0, 2000),
        source_language_code: sourceCode,
        target_language_code: targetCode,
        speaker_gender: 'Male',
        mode: 'formal',
        model: 'mayura:v1',
        enable_preprocessing: true,
        output_script: 'native',
        numerals_format: 'international'
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[Sarvam Translate Error]: HTTP ${response.status}: ${errText}`);
      return null;
    }

    const data = (await response.json()) as { translated_text?: string };
    if (data.translated_text) {
      return cleanSpecialCharacters(data.translated_text);
    }
    return null;
  } catch (err) {
    console.warn('[Sarvam Translate Error]: Translation request failed:', err);
    return null;
  }
}

/**
 * Generates natural regional text answers via Sarvam AI Indic Chat Model
 * (e.g. sarvam-105b or sarvam-2b)
 */
export async function chatWithSarvam(params: {
  message: string;
  lang: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  webContext?: string;
}): Promise<string | null> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_sarvam_api_key_here') {
    return null;
  }

  const { message, lang, history = [], webContext = '' } = params;
  const langName = getRegionalLanguageName(lang);
  const model = process.env.SARVAM_CHAT_MODEL || 'sarvam-105b';

  const systemPrompt = `You are JARVIS — The Time Traveller, an autonomous AI research and temporal intelligence assistant.
You are communicating directly with the user in ${langName}.
You MUST respond completely and naturally in ${langName}.
Provide rich, factual, and helpful insights based on the available research context:
${webContext ? `\n[Verified Research Context]:\n${webContext.slice(0, 2500)}\n` : ''}

CRITICAL FORMATTING INSTRUCTIONS:
1. Do NOT use markdown hashtags (#, ##, ###, ####) for headings. Use clean plain text headers.
2. Do NOT use markdown asterisks (* or **) for bold/italic.
3. Do NOT use dashed divider lines (--- or ***).
4. Use clean numbered points (1., 2.) or bullet dots (•).
5. Ensure authentic, natural grammar and polite phrasing in ${langName}.`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(18000)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[Sarvam Chat Completion Error]: HTTP ${response.status}: ${errText}`);
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content;
    if (text) {
      return cleanSpecialCharacters(text);
    }
    return null;
  } catch (err) {
    console.warn('[Sarvam Chat Error]: Regional chat completion failed:', err);
    return null;
  }
}
