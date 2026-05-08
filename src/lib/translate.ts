const DEEPL_API = 'https://api-free.deepl.com/v2/translate';

const LANG_MAP: Record<string, string> = { en: 'EN-GB', it: 'IT' };

async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY;
  if (!key || !texts.length) return texts;

  const res = await fetch(DEEPL_API, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texts, source_lang: 'DE', target_lang: LANG_MAP[targetLang] ?? targetLang.toUpperCase() }),
  });

  if (!res.ok) return texts;
  const data = await res.json() as { translations: { text: string }[] };
  return data.translations.map((t) => t.text);
}

// Translates a map of { fieldName: deText } into { en: { fieldName: '...' }, it: { fieldName: '...' } }
// Only non-empty strings are translated. Existing translations are merged in (not overwritten if unchanged).
export async function autoTranslateFields(
  fields: Record<string, string | null>,
  existing?: Record<string, Record<string, string>> | null,
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = { ...(existing ?? {}) };

  const keys = Object.keys(fields).filter((k) => !!fields[k]);
  const texts = keys.map((k) => fields[k] as string);

  for (const lang of ['en', 'it']) {
    if (!texts.length) break;
    const translated = await translateBatch(texts, lang);
    result[lang] = { ...(result[lang] ?? {}) };
    keys.forEach((k, i) => { result[lang][k] = translated[i]; });
  }

  return result;
}
