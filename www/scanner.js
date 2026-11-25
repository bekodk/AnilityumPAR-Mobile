'use strict';
/* =====================================================================
   AnilityumPAR Mobile — Çoklu Fotoğraftan Şarkı Tarayıcı
   Desteklenen motorlar:
     1) Yerleşik OCR (Tesseract.js, API anahtarı gerektirmez)
     2) Gemini AI Görsel Tarama (gemini-3.8-flash, isteğe bağlı API anahtarı)
   ===================================================================== */

(function (global) {
  const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  const GEMINI_MODEL = 'gemini-3.8-flash';

  const UI_NOISE_EXACT = new Set([
    'beğenilen şarkılar', 'begenilen sarkilar', 'liked songs', 'çalma listesi',
    'calma listesi', 'playlist', 'çal', 'cal', 'play', 'karıştır', 'karistir',
    'shuffle', 'ara', 'search', 'ana sayfa', 'home', 'kitaplığın', 'kitapligin',
    'kitaplık', 'library', 'ekle', 'add', 'indir', 'download', 'paylaş', 'paylas',
    'share', 'sözler', 'sozler', 'lyrics', 'şarkılar', 'sarkilar', 'songs',
    'sanatçılar', 'sanatcilar', 'artists', 'albümler', 'albumler', 'albums',
    'en çok dinlenenler', 'son dinlenenler', 'sıradakiler', 'siradakiler',
    'queue', 'explicit', 'e', 'hd', 'hq', '4k', 'lte', '5g', '4g', '3g',
    'wi-fi', 'wifi', 'turkcell', 'vodafone', 'türk telekom', 'turk telekom',
    'spotify', 'apple music', 'youtube music', 'youtube', 'anilityumpar',
    'düzenle', 'duzenle', 'edit', 'sırala', 'sirala', 'sort', 'filtrele',
    'tümü', 'tumu', 'all', 'müzik', 'muzik', 'music', 'podcastler', 'takip et',
    'abone ol', 'subscribe', 'premium', 'keşfet', 'kesfet', 'explore'
  ]);

  const TIME_ONLY_RE = /^\d{1,2}:\d{2}(:\d{2})?$/;
  const PERCENT_OR_STATS_RE = /^(\d{1,3}%|\d+[.,]?\d*\s*(b|m|k|mn|bin|milyon|görüntüleme|izlenme|dinlenme|şarkı|sarki|songs?|sa|dk|min|hr)s?)$/i;
  const LEADING_INDEX_RE = /^\s*(?:#?\d{1,3}[\.\)\-:]|\u2022|\*|\|)\s+/;
  const TRAILING_DUR_RE = /\s+\d{1,2}:\d{2}(:\d{2})?\s*$/;
  const EXPLICIT_PREFIX_RE = /^(?:[E®©•·▪▫◆◇○●★☆▶►▷▸▹✓✔✕✖+]|\[E\]|\(E\))\s+/i;
  const VIDEO_NOISE_RE = /\s*[\(\[][^\)\]]*(official|video|audio|lyric|klip|music|mv|hd|4k|visuali[sz]er|remaster|sözler|resmi|clip|live|feat\.?[^)\]]*)[^\)\]]*[\)\]]/gi;

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (global.Tesseract) return resolve(global.Tesseract);
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(global.Tesseract));
        existing.addEventListener('error', () => reject(new Error('Tesseract.js yüklenemedi.')));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve(global.Tesseract);
      s.onerror = () => reject(new Error('Tesseract.js CDN erişilemedi. İnternet bağlantınızı kontrol edin.'));
      document.head.appendChild(s);
    });
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Görsel okunamadı: ${file.name}`));
      };
      img.src = url;
    });
  }

  async function resizeImageToBase64(file, maxDim = 1400, quality = 0.84) {
    const img = await loadImageFromFile(file);
    let { width, height } = img;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return {
      mimeType: 'image/jpeg',
      base64: dataUrl.split(',')[1]
    };
  }

  /**
   * Koyu tema (Spotify / YouTube Music / Apple Music) ekran görüntülerini
   * OCR için otomatik ters çevirip kontrastı artırır.
   */
  async function preprocessForOCR(file) {
    const img = await loadImageFromFile(file);
    const targetMax = 1600;
    const minWidth = 900;
    let scale = Math.min(1, targetMax / Math.max(img.width, img.height));
    if (img.width * scale < minWidth && img.width < targetMax) {
      scale = Math.min(2, minWidth / img.width);
    }
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;

    // Ortalama parlaklığı örnekle
    let lumSum = 0;
    let sampleCount = 0;
    for (let i = 0; i < d.length; i += 64) {
      lumSum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      sampleCount++;
    }
    const avgLum = sampleCount ? lumSum / sampleCount : 255;
    const isDarkMode = avgLum < 120;

    for (let i = 0; i < d.length; i += 4) {
      let g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (isDarkMode) g = 255 - g;
      // Kontrastı keskinleştir
      g = (g - 128) * 1.38 + 128;
      g = g < 0 ? 0 : g > 255 ? 255 : g;
      d[i] = d[i + 1] = d[i + 2] = g;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  function cleanLineText(raw) {
    let s = String(raw || '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    s = s.replace(LEADING_INDEX_RE, '');
    s = s.replace(EXPLICIT_PREFIX_RE, '');
    s = s.replace(TRAILING_DUR_RE, '');
    s = s.replace(/[•·]+$/g, '').replace(/^[•·]+/g, '').trim();
    return s;
  }

  function isNoiseLine(text) {
    if (!text) return true;
    const lower = text.toLocaleLowerCase('tr-TR').trim();
    if (lower.length < 2 || lower.length > 110) return true;
    if (UI_NOISE_EXACT.has(lower)) return true;
    if (TIME_ONLY_RE.test(lower)) return true;
    if (PERCENT_OR_STATS_RE.test(lower)) return true;
    if (/^[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+$/.test(lower)) return true;
    if (/^\d+$/.test(lower)) return true;
    if (/^(eklenme tarihi|date added|oluşturan|created by|toplam|saat|dakika)/i.test(lower)) return true;
    if (/\d+\s*(şarkı|sarki|songs?)\s*[•·,]/i.test(lower)) return true;
    return false;
  }

  function splitDashTrack(line) {
    const m = line.split(/\s+[-–—]\s+/);
    if (m.length === 2 && m[0].trim().length >= 2 && m[1].trim().length >= 2) {
      return { artist: m[0].trim(), title: m[1].trim() };
    }
    return null;
  }

  function deduplicateSongs(songs) {
    const seen = new Set();
    const out = [];
    for (const item of songs) {
      const title = String(item.title || '').replace(VIDEO_NOISE_RE, '').trim();
      const artist = String(item.artist || '').trim();
      if (!title || title.length < 2) continue;
      const key = `${title.toLocaleLowerCase('tr-TR')}|${artist.toLocaleLowerCase('tr-TR')}`
        .replace(/[^a-z0-9çğıöşü|]/g, '');
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ title, artist });
    }
    return out;
  }

  /**
   * Tesseract satırlarından (veya düz metinden) şarkı adı + sanatçı çiftlerini çıkarır.
   * Ekran görüntülerindeki dikey satır boşluklarını (bbox) kullanarak "Başlık + Altındaki Sanatçı"
   * çiftlerini akıllıca gruplar.
   */
  function parseOCRResult(ocrData) {
    const rawLines = Array.isArray(ocrData?.lines) && ocrData.lines.length
      ? ocrData.lines.map((l) => ({
          text: cleanLineText(l.text),
          y0: l.bbox?.y0 ?? 0,
          y1: l.bbox?.y1 ?? 0,
          h: Math.max(1, (l.bbox?.y1 ?? 0) - (l.bbox?.y0 ?? 0)),
          conf: l.confidence ?? 80
        }))
      : String(ocrData?.text || '')
          .split(/\r?\n/)
          .map((t, idx) => ({ text: cleanLineText(t), y0: idx * 30, y1: idx * 30 + 20, h: 20, conf: 80 }));

    const lines = rawLines.filter((l) => l.conf >= 28 && !isNoiseLine(l.text));
    if (!lines.length) return [];

    // Satırlar arası dikey boşlukları hesapla
    const gaps = [];
    for (let i = 1; i < lines.length; i++) {
      const g = lines[i].y0 - lines[i - 1].y1;
      if (g > 0 && g < 300) gaps.push(g);
    }
    gaps.sort((a, b) => a - b);
    const medianGap = gaps.length ? gaps[Math.floor(gaps.length * 0.5)] : 16;

    const songs = [];
    let i = 0;
    while (i < lines.length) {
      const cur = lines[i];
      const dash = splitDashTrack(cur.text);
      if (dash) {
        songs.push(dash);
        i++;
        continue;
      }

      const next = lines[i + 1];
      if (next && !splitDashTrack(next.text)) {
        const gapToNext = next.y0 - cur.y1;
        const afterNext = lines[i + 2];
        const gapAfter = afterNext ? afterNext.y0 - next.y1 : medianGap * 2;
        const looksPairedByLayout =
          gapToNext >= -4 &&
          gapToNext <= Math.max(cur.h * 1.15, medianGap * 0.95) &&
          (gapAfter > gapToNext * 1.25 || !afterNext);
        const looksLikeArtistLine =
          next.text.includes(',') ||
          next.text.includes('&') ||
          /\b(feat|ft)\b/i.test(next.text) ||
          next.h <= cur.h * 1.05;

        if (looksPairedByLayout && looksLikeArtistLine) {
          songs.push({ title: cur.text, artist: next.text });
          i += 2;
          continue;
        }
      }

      songs.push({ title: cur.text, artist: '' });
      i++;
    }

    return deduplicateSongs(songs);
  }

  async function scanImagesWithTesseract(files, onProgress) {
    const list = Array.from(files || []);
    if (!list.length) return [];

    onProgress?.(5, 'OCR motoru hazırlanıyor (ilk seferde birkaç saniye sürer)...');
    const Tesseract = await loadScriptOnce(TESSERACT_CDN);
    const worker = await Tesseract.createWorker('tur+eng', 1, {
      logger: (m) => {
        if (m.status === 'loading language traineddata') {
          onProgress?.(12, 'Türkçe/İngilizce dil paketi indiriliyor...');
        }
      }
    });

    const collected = [];
    try {
      for (let idx = 0; idx < list.length; idx++) {
        const file = list[idx];
        const basePct = 15 + Math.round((idx / list.length) * 80);
        onProgress?.(basePct, `Fotoğraf ${idx + 1} / ${list.length} taranıyor...`);
        const canvas = await preprocessForOCR(file);
        const { data } = await worker.recognize(canvas);
        const parsed = parseOCRResult(data);
        collected.push(...parsed);
      }
    } finally {
      await worker.terminate();
    }

    onProgress?.(100, 'Tarama tamamlandı!');
    return deduplicateSongs(collected);
  }

  function extractInteractionText(resp) {
    if (typeof resp?.output_text === 'string' && resp.output_text.trim()) {
      return resp.output_text;
    }
    if (Array.isArray(resp?.steps)) {
      for (let i = resp.steps.length - 1; i >= 0; i--) {
        const step = resp.steps[i];
        if (step?.type === 'model_output' && Array.isArray(step.content)) {
          const textPart = step.content.find((c) => c?.type === 'text' && c?.text);
          if (textPart?.text) return textPart.text;
        }
      }
    }
    if (Array.isArray(resp?.outputs)) {
      for (let i = resp.outputs.length - 1; i >= 0; i--) {
        if (resp.outputs[i]?.text) return resp.outputs[i].text;
      }
    }
    return '';
  }

  async function scanImagesWithGemini(files, apiKey, onProgress) {
    const list = Array.from(files || []);
    if (!list.length) return [];
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Gemini AI taraması için Ayarlar bölümünden Gemini API anahtarı eklemelisiniz.');
    }

    const BATCH_SIZE = 5;
    const collected = [];
    const totalBatches = Math.ceil(list.length / BATCH_SIZE);

    for (let b = 0; b < totalBatches; b++) {
      const batch = list.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      const pct = Math.round(((b + 0.2) / totalBatches) * 90);
      onProgress?.(pct, `Gemini AI görselleri analiz ediyor (${b + 1}/${totalBatches} grup)...`);

      const inputParts = [
        {
          type: 'text',
          text:
            'Bu fotoğraflardaki (çalma listesi ekran görüntüleri, şarkı listeleri veya albüm listeleri) ' +
            'TÜM şarkı adlarını ve varsa sanatçı adlarını sırasıyla çıkar. ' +
            'Telefon saati, pil yüzdesi, uygulama menü yazıları (Beğenilen Şarkılar, Çal, Karıştır vb.) ' +
            've süreleri (3:45) dahil ETME. Tekrar eden şarkıları sadece bir kez yaz.'
        }
      ];

      for (const file of batch) {
        const resized = await resizeImageToBase64(file, 1400, 0.84);
        inputParts.push({
          type: 'image',
          data: resized.base64,
          mime_type: resized.mimeType
        });
      }

      const res = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim(),
          'Api-Revision': '2026-05-20'
        },
        body: JSON.stringify({
          model: GEMINI_MODEL,
          input: inputParts,
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: {
              type: 'object',
              properties: {
                songs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      artist: { type: 'string' }
                    },
                    required: ['title']
                  }
                }
              },
              required: ['songs']
            }
          }
        })
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = payload?.error?.message || `Gemini API hatası (${res.status})`;
        throw new Error(msg);
      }

      const rawJson = extractInteractionText(payload);
      let parsedObj = null;
      try {
        parsedObj = JSON.parse(rawJson);
      } catch {
        const m = rawJson.match(/\{[\s\S]*\}/);
        if (m) parsedObj = JSON.parse(m[0]);
      }

      if (Array.isArray(parsedObj?.songs)) {
        collected.push(...parsedObj.songs);
      }
    }

    onProgress?.(100, 'Gemini AI taraması tamamlandı!');
    return deduplicateSongs(collected);
  }

  global.AnilityumScanner = {
    scanImagesWithTesseract,
    scanImagesWithGemini,
    parseOCRResult,
    deduplicateSongs,
    cleanLineText
  };
})(typeof window !== 'undefined' ? window : globalThis);
