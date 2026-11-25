'use strict';
/* =====================================================================
   AnilityumPAR Mobile — Ana Uygulama Mantığı
   Resmi YouTube IFrame Player API + YouTube Data API v3 + iTunes Önizleme
   + LRCLIB Senkronize Şarkı Sözleri + Çoklu Fotoğraftan Liste Oluşturucu
   ===================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtSec = (sec) => {
  const s = Math.max(0, Math.floor(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const STORAGE_KEY = 'anilityumpar_mobile_v1';

/* ------------------------------------------------------------ İKONLAR */
const ICONS = {
  home: { p: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' },
  search: { p: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>' },
  camera: { p: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>' },
  library: { p: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>' },
  settings: { p: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
  chevL: { p: '<path d="m15 18-6-6 6-6"/>' },
  chevD: { p: '<path d="m6 9 6 6 6-6"/>' },
  x: { p: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' },
  plus: { p: '<path d="M12 5v14"/><path d="M5 12h14"/>' },
  play: { f: 1, p: '<path d="M7.05 3.606 20.54 11.394a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>' },
  pause: { f: 1, p: '<rect x="5.5" y="3.5" width="4.5" height="17" rx="1"/><rect x="14" y="3.5" width="4.5" height="17" rx="1"/>' },
  next: { f: 1, p: '<path d="M17.7 3a.7.7 0 0 1 .7.7v16.6a.7.7 0 0 1-.7.7h-1.6a.7.7 0 0 1-.7-.7V3.7a.7.7 0 0 1 .7-.7h1.6z"/><path d="M3 3.606a.7.7 0 0 1 1.05-.606l10.5 8.394a.7.7 0 0 1 0 1.212L4.05 21A.7.7 0 0 1 3 20.394z"/>' },
  prev: { f: 1, p: '<path d="M6.3 3a.7.7 0 0 1 .7.7v16.6a.7.7 0 0 1-.7.7H4.7a.7.7 0 0 1-.7-.7V3.7a.7.7 0 0 1 .7-.7h1.6z"/><path d="M21 3.606A.7.7 0 0 0 19.95 3L9.45 11.394a.7.7 0 0 0 0 1.212L19.95 21A.7.7 0 0 0 21 20.394z"/>' },
  shuffle: { p: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>' },
  repeat: { p: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>' },
  repeat1: { p: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M12 10v4"/>' },
  heart: { p: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>' },
  heartf: { f: 1, p: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>' },
  video: { p: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/>' },
  listPlus: { p: '<path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M18 9v6"/><path d="M21 12h-6"/>' },
  music: { p: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>' },
  clock: { p: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>' },
  trash: { p: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' },
  link: { p: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' },
  sparkle: { p: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>' },
  image: { p: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>' }
};

function ic(name, cls = '') {
  const d = ICONS[name];
  if (!d) return '';
  const attrs = d.f
    ? 'fill="currentColor"'
    : `fill="none" stroke="currentColor" stroke-width="${d.w || 2}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" ${attrs}>${d.p}</svg>`;
}

const GENRES = [
  { n: 'Türkçe Pop', q: 'türkçe pop hit', c: '#a21caf', e: '🎤' },
  { n: 'Türkçe Rap', q: 'türkçe rap', c: '#6d28d9', e: '🔥' },
  { n: 'Global Pop', q: 'top pop hits', c: '#be185d', e: '✨' },
  { n: 'Rock', q: 'rock classics', c: '#b91c1c', e: '🎸' },
  { n: 'Arabesk', q: 'arabesk şarkılar', c: '#1d4ed8', e: '🌙' },
  { n: 'Lo-Fi & Chill', q: 'lofi chill beats', c: '#0e7490', e: '☕' },
  { n: 'Elektronik', q: 'electronic dance music', c: '#0369a1', e: '⚡' },
  { n: 'Antrenman', q: 'workout gym music', c: '#c2410c', e: '💪' }
];

const NOISE_TITLE_RE = /\s*[\(\[][^\)\]]*(official|video|audio|lyric|klip|music|mv|hd|4k|visuali[sz]er|remaster|sözler|resmi|clip)[^\)\]]*[\)\]]/gi;

/* ------------------------------------------------------------ DURUM */
const state = {
  data: loadStorage(),
  tab: 'home',
  subview: null, // { type: 'playlist', id } | { type: 'favorites' } | { type: 'history' }
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchSource: 'auto', // 'auto' | 'youtube' | 'itunes'

  // Oynatıcı durumu
  queue: [],
  qi: -1,
  cur: null,
  contextName: 'AnilityumPAR',
  playing: false,
  pos: 0,
  dur: 0,
  shuffle: false,
  repeat: 'off', // 'off' | 'all' | 'one'
  videoMode: false,
  npOpen: false,
  npSubtab: 'lyrics',
  lyrics: null, // { synced: [{t, text}], plain: string } | null
  activeLyricIdx: -1,
  seeking: false,

  // YouTube IFrame Player
  ytReady: false,
  ytPlayer: null,
  pendingYtId: null,

  // Çoklu Fotoğraf Tarayıcı Durumu
  scanner: {
    files: [], // [{ id, file, url }]
    engine: 'ocr', // 'ocr' | 'gemini'
    scanning: false,
    matching: false,
    progressPct: 0,
    progressMsg: '',
    detected: [], // [{ id, checked, title, artist, status, matchedTrack }]
    targetPlaylistId: '__new__',
    newPlaylistName: defaultScanPlaylistName(),
    lastCreatedPlaylistId: null
  },

  // Modal bağlamı
  playlistModalTrack: null
};

function defaultScanPlaylistName() {
  const now = new Date();
  const label = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  return `Fotoğraftan Liste • ${label}`;
}

function loadStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      settings: {
        youtubeApiKey: parsed.settings?.youtubeApiKey || '',
        geminiApiKey: parsed.settings?.geminiApiKey || ''
      }
    };
  } catch {
    return {
      favorites: [],
      playlists: [],
      history: [],
      settings: { youtubeApiKey: '', geminiApiKey: '' }
    };
  }
}

function saveStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  } catch (err) {
    console.warn('Kayıt hatası:', err);
  }
}

/* ------------------------------------------------------------ BİLDİRİM */
let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ------------------------------------------------------------ YOUTUBE IFRAME PLAYER */
const previewAudio = $('#previewAudio');

window.onYouTubeIframeAPIReady = function () {
  initYouTubePlayer();
};

function initYouTubePlayer() {
  if (state.ytPlayer || !window.YT || !window.YT.Player) return;
  state.ytPlayer = new window.YT.Player('ytPlayerMount', {
    height: '180',
    width: '320',
    playerVars: {
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
      controls: 1,
      enablejsapi: 1,
      origin: location.origin.startsWith('http') ? location.origin : undefined
    },
    events: {
      onReady: () => {
        state.ytReady = true;
        if (state.pendingYtId) {
          const id = state.pendingYtId;
          state.pendingYtId = null;
          state.ytPlayer.loadVideoById(id);
        }
      },
      onStateChange: (ev) => {
        if (!state.cur || state.cur.source !== 'youtube') return;
        const YTState = window.YT.PlayerState;
        if (ev.data === YTState.PLAYING) {
          state.playing = true;
          updatePlayerUI();
        } else if (ev.data === YTState.PAUSED) {
          state.playing = false;
          updatePlayerUI();
        } else if (ev.data === YTState.ENDED) {
          onTrackEnded();
        }
      },
      onError: (ev) => {
        if (!state.cur || state.cur.source !== 'youtube') return;
        const code = ev.data;
        if (code === 101 || code === 150) {
          toast('Bu YouTube videosu gömülü oynatmaya kapalı. Sonraki deneniyor...');
        } else {
          toast(`YouTube oynatma hatası (Kod: ${code})`);
        }
      }
    }
  });
}

previewAudio.addEventListener('play', () => {
  if (state.cur?.source === 'itunes') {
    state.playing = true;
    updatePlayerUI();
  }
});
previewAudio.addEventListener('pause', () => {
  if (state.cur?.source === 'itunes') {
    state.playing = false;
    updatePlayerUI();
  }
});
previewAudio.addEventListener('ended', () => {
  if (state.cur?.source === 'itunes') onTrackEnded();
});
previewAudio.addEventListener('timeupdate', () => {
  if (state.cur?.source === 'itunes' && !state.seeking) {
    state.pos = previewAudio.currentTime || 0;
    state.dur = previewAudio.duration || state.cur.duration || 30;
    updateProgressUI();
  }
});

setInterval(() => {
  if (state.cur?.source === 'youtube' && state.ytReady && state.ytPlayer && !state.seeking) {
    try {
      const t = state.ytPlayer.getCurrentTime?.() || 0;
      const d = state.ytPlayer.getDuration?.() || state.cur.duration || 0;
      state.pos = t;
      if (d > 0) state.dur = d;
      updateProgressUI();
    } catch {
      /* yoksay */
    }
  }
}, 350);

/* ------------------------------------------------------------ ARAMA SERVİSLERİ */
function parseIsoDuration(iso) {
  const m = String(iso || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || '0', 10) * 3600) + (parseInt(m[2] || '0', 10) * 60) + parseInt(m[3] || '0', 10);
}

function cleanYouTubeMeta(rawTitle, channelTitle) {
  const titleDecoded = decodeHtmlEntities(rawTitle || '');
  const ch = decodeHtmlEntities(channelTitle || '').replace(/\s*-\s*Topic$/i, '').replace(/\s*VEVO$/i, '').trim();
  let artist = ch || 'YouTube';
  let title = titleDecoded.trim();
  const parts = title.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }
  title = title.replace(NOISE_TITLE_RE, '').replace(/\s*\|.*$/, '').trim() || titleDecoded;
  return { title, artist };
}

function decodeHtmlEntities(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

async function searchYouTube(query, maxResults = 12) {
  const key = state.data.settings.youtubeApiKey.trim();
  if (!key) throw new Error('YouTube API anahtarı ayarlı değil.');

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true` +
    `&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`;

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `YouTube API hatası (${res.status})`);
  }

  const items = data.items || [];
  if (!items.length) return [];

  const ids = items.map((i) => i.id?.videoId).filter(Boolean);
  let durations = {};
  if (ids.length) {
    try {
      const vRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids.join(',')}&key=${encodeURIComponent(key)}`
      );
      const vData = await vRes.json();
      for (const v of vData.items || []) {
        durations[v.id] = parseIsoDuration(v.contentDetails?.duration);
      }
    } catch {
      /* süre opsiyonel */
    }
  }

  return items
    .filter((i) => i.id?.videoId)
    .map((i) => {
      const vid = i.id.videoId;
      const meta = cleanYouTubeMeta(i.snippet?.title, i.snippet?.channelTitle);
      return {
        id: `yt_${vid}`,
        source: 'youtube',
        ytId: vid,
        previewUrl: null,
        title: meta.title,
        artist: meta.artist,
        thumb: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
        duration: durations[vid] || 0
      };
    });
}

async function searchItunes(query, limit = 15) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&country=TR&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Müzik arama servisine ulaşılamadı.');
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: `it_${r.trackId}`,
    source: 'itunes',
    ytId: null,
    previewUrl: r.previewUrl || null,
    title: r.trackName || 'Bilinmeyen Şarkı',
    artist: r.artistName || 'Bilinmeyen Sanatçı',
    thumb: (r.artworkUrl100 || '').replace('100x100', '600x600'),
    duration: Math.round((r.trackTimeMillis || 30000) / 1000)
  }));
}

async function smartSearch(query, maxResults = 12) {
  const hasYtKey = Boolean(state.data.settings.youtubeApiKey.trim());
  const useYt = state.searchSource === 'youtube' || (state.searchSource === 'auto' && hasYtKey);

  if (useYt) {
    return await searchYouTube(query, maxResults);
  }
  return await searchItunes(query, maxResults);
}

function extractYouTubeId(raw) {
  const text = String(raw || '').trim();
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1];
  }
  return null;
}

function extractYouTubePlaylistId(raw) {
  const m = String(raw || '').match(/[?&]list=([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

async function importYouTubeLink(rawUrl) {
  const plId = extractYouTubePlaylistId(rawUrl);
  const ytKey = state.data.settings.youtubeApiKey.trim();

  if (plId && ytKey) {
    toast('YouTube çalma listesi içe aktarılıyor...');
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(plId)}&key=${encodeURIComponent(ytKey)}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'YouTube listesi alınamadı.');
    const tracks = (data.items || [])
      .filter((i) => i.snippet?.resourceId?.videoId)
      .map((i) => {
        const vid = i.snippet.resourceId.videoId;
        const meta = cleanYouTubeMeta(i.snippet.title, i.snippet.videoOwnerChannelTitle || i.snippet.channelTitle);
        return {
          id: `yt_${vid}`,
          source: 'youtube',
          ytId: vid,
          previewUrl: null,
          title: meta.title,
          artist: meta.artist,
          thumb: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
          duration: 0
        };
      });
    if (!tracks.length) throw new Error('Listede oynatılabilir video bulunamadı.');
    const pl = createPlaylist(`YouTube Listesi (${tracks.length})`, tracks);
    toast(`${tracks.length} şarkı listeye eklendi!`);
    openPlaylist(pl.id);
    return;
  }

  const vid = extractYouTubeId(rawUrl);
  if (!vid) {
    throw new Error('Geçerli bir YouTube video veya çalma listesi bağlantısı yapıştırın.');
  }

  let title = 'YouTube Videosu';
  let artist = 'YouTube';
  try {
    const oRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`);
    if (oRes.ok) {
      const o = await oRes.json();
      const meta = cleanYouTubeMeta(o.title, o.author_name);
      title = meta.title;
      artist = meta.artist;
    }
  } catch {
    /* oEmbed erişilemezse varsayılan ad kalır */
  }

  const track = {
    id: `yt_${vid}`,
    source: 'youtube',
    ytId: vid,
    previewUrl: null,
    title,
    artist,
    thumb: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
    duration: 0
  };
  playTrack(track, [track], 0, 'YouTube Bağlantısı');
  openNowPlaying();
}

/* ------------------------------------------------------------ OYNATMA KONTROLLERİ */
function playTrack(track, list = null, index = 0, contextName = 'AnilityumPAR') {
  if (!track) return;
  if (Array.isArray(list) && list.length) {
    state.queue = [...list];
    state.qi = Math.max(0, Math.min(index, list.length - 1));
  } else {
    state.queue = [track];
    state.qi = 0;
  }
  state.cur = track;
  state.contextName = contextName || 'AnilityumPAR';
  state.pos = 0;
  state.dur = track.duration || 0;
  state.lyrics = null;
  state.activeLyricIdx = -1;

  // Geçmişe ekle
  state.data.history = [track, ...state.data.history.filter((t) => t.id !== track.id)].slice(0, 50);
  saveStorage();

  // Diğer motoru durdur ve uygun motoru başlat
  if (track.source === 'youtube' && track.ytId) {
    previewAudio.pause();
    previewAudio.removeAttribute('src');
    if (state.ytReady && state.ytPlayer) {
      state.ytPlayer.loadVideoById(track.ytId);
    } else {
      state.pendingYtId = track.ytId;
      initYouTubePlayer();
    }
    state.playing = true;
  } else if (track.previewUrl) {
    if (state.ytReady && state.ytPlayer?.pauseVideo) {
      try { state.ytPlayer.pauseVideo(); } catch { /* yoksay */ }
    }
    state.videoMode = false;
    previewAudio.src = track.previewUrl;
    previewAudio.play().catch(() => toast('Oynatmak için Çal tuşuna dokunun.'));
    state.playing = true;
  } else {
    toast('Bu parça için oynatılabilir kaynak bulunamadı.');
    return;
  }

  updateMediaSession(track);
  updatePlayerUI();
  syncVideoDock();
  fetchLyrics(track);
  renderActiveTrackHighlight();
}

function togglePlay() {
  if (!state.cur) return;
  if (state.cur.source === 'youtube') {
    if (!state.ytReady || !state.ytPlayer) return;
    if (state.playing) state.ytPlayer.pauseVideo();
    else state.ytPlayer.playVideo();
  } else {
    if (previewAudio.paused) previewAudio.play().catch(() => {});
    else previewAudio.pause();
  }
}

function seekTo(sec) {
  if (!state.cur) return;
  if (state.cur.source === 'youtube' && state.ytReady && state.ytPlayer) {
    state.ytPlayer.seekTo(sec, true);
  } else if (state.cur.source === 'itunes') {
    previewAudio.currentTime = sec;
  }
  state.pos = sec;
  updateProgressUI();
}

function nextTrack() {
  if (!state.queue.length) return;
  if (state.shuffle && state.queue.length > 1) {
    let nextIdx = state.qi;
    while (nextIdx === state.qi) nextIdx = Math.floor(Math.random() * state.queue.length);
    playTrack(state.queue[nextIdx], state.queue, nextIdx, state.contextName);
    return;
  }
  const nextIdx = state.qi + 1;
  if (nextIdx < state.queue.length) {
    playTrack(state.queue[nextIdx], state.queue, nextIdx, state.contextName);
  } else if (state.repeat === 'all') {
    playTrack(state.queue[0], state.queue, 0, state.contextName);
  }
}

function prevTrack() {
  if (!state.cur) return;
  if (state.pos > 3) {
    seekTo(0);
    return;
  }
  if (!state.queue.length) return;
  const prevIdx = state.qi > 0 ? state.qi - 1 : state.queue.length - 1;
  playTrack(state.queue[prevIdx], state.queue, prevIdx, state.contextName);
}

function onTrackEnded() {
  if (state.repeat === 'one' && state.cur) {
    seekTo(0);
    if (state.cur.source === 'youtube' && state.ytPlayer) state.ytPlayer.playVideo();
    else previewAudio.play().catch(() => {});
    return;
  }
  if (state.qi + 1 < state.queue.length || state.repeat === 'all' || state.shuffle) {
    nextTrack();
  } else {
    state.playing = false;
    updatePlayerUI();
  }
}

function updateMediaSession(track) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: state.contextName,
      artwork: track.thumb ? [{ src: track.thumb, sizes: '512x512', type: 'image/jpeg' }] : []
    });
    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
  } catch {
    /* yoksay */
  }
}

/* ------------------------------------------------------------ ŞARKI SÖZLERİ (LRCLIB) */
function parseLrc(lrcText) {
  const lines = [];
  for (const raw of String(lrcText || '').split('\n')) {
    const m = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    if (m) {
      const t = parseInt(m[1], 10) * 60 + parseFloat(m[2]);
      const text = m[3].trim();
      if (text) lines.push({ t, text });
    }
  }
  return lines;
}

async function fetchLyrics(track) {
  const panel = $('#npLyricsPanel');
  if (panel) panel.innerHTML = '<div class="lyrics-empty">Şarkı sözleri aranıyor...</div>';
  const curId = track.id;

  try {
    const artist = (track.artist || '').split(',')[0].split('&')[0].trim();
    let items = [];
    const r1 = await fetch(
      `https://lrclib.net/api/search?track_name=${encodeURIComponent(track.title)}&artist_name=${encodeURIComponent(artist)}`
    );
    if (r1.ok) items = await r1.json();

    if (!items.length) {
      const r2 = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${artist} ${track.title}`)}`);
      if (r2.ok) items = await r2.json();
    }

    if (state.cur?.id !== curId) return;

    const valid = items.filter((i) => i.syncedLyrics || i.plainLyrics);
    valid.sort((a, b) => (b.syncedLyrics ? 1 : 0) - (a.syncedLyrics ? 1 : 0));

    if (!valid.length) {
      state.lyrics = null;
      renderLyricsPanel();
      return;
    }

    const best = valid[0];
    state.lyrics = {
      synced: best.syncedLyrics ? parseLrc(best.syncedLyrics) : [],
      plain: best.plainLyrics || ''
    };
    renderLyricsPanel();
  } catch {
    if (state.cur?.id === curId) {
      state.lyrics = null;
      renderLyricsPanel();
    }
  }
}

function renderLyricsPanel() {
  const panel = $('#npLyricsPanel');
  if (!panel) return;
  if (!state.lyrics) {
    panel.innerHTML = '<div class="lyrics-empty">Bu şarkı için söz bulunamadı.</div>';
    return;
  }
  if (state.lyrics.synced?.length) {
    panel.innerHTML = state.lyrics.synced
      .map((l, idx) => `<div class="lyric-line" data-lrc-idx="${idx}" data-lrc-time="${l.t}">${esc(l.text)}</div>`)
      .join('');
    panel.querySelectorAll('.lyric-line').forEach((el) => {
      el.addEventListener('click', () => seekTo(parseFloat(el.dataset.lrcTime)));
    });
  } else if (state.lyrics.plain) {
    panel.innerHTML = state.lyrics.plain
      .split('\n')
      .map((line) => `<div class="lyric-line active" style="opacity:.85">${esc(line) || '&nbsp;'}</div>`)
      .join('');
  }
}

function syncLyricHighlight() {
  if (!state.lyrics?.synced?.length) return;
  const arr = state.lyrics.synced;
  let active = -1;
  for (let i = 0; i < arr.length; i++) {
    if (state.pos >= arr[i].t - 0.25) active = i;
    else break;
  }
  if (active === state.activeLyricIdx) return;
  state.activeLyricIdx = active;
  const panel = $('#npLyricsPanel');
  if (!panel) return;
  panel.querySelectorAll('.lyric-line').forEach((el, i) => {
    el.classList.toggle('active', i === active);
  });
  const activeEl = panel.querySelector(`.lyric-line[data-lrc-idx="${active}"]`);
  if (activeEl && state.npOpen && state.npSubtab === 'lyrics') {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ------------------------------------------------------------ FAVORİLER & LİSTELER */
function isFavorite(trackId) {
  return state.data.favorites.some((t) => t.id === trackId);
}

function toggleFavorite(track) {
  if (!track) return;
  const idx = state.data.favorites.findIndex((t) => t.id === track.id);
  if (idx >= 0) {
    state.data.favorites.splice(idx, 1);
    toast('Favorilerden kaldırıldı');
  } else {
    state.data.favorites.unshift(track);
    toast('Favorilere eklendi');
  }
  saveStorage();
  updatePlayerUI();
  if (state.tab === 'library' || state.subview?.type === 'favorites' || state.tab === 'search') {
    renderView();
  }
}

function createPlaylist(name, initialTracks = []) {
  const cleanName = String(name || '').trim() || 'Yeni Çalma Listesi';
  const pl = {
    id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    createdAt: Date.now(),
    tracks: [...initialTracks]
  };
  state.data.playlists.unshift(pl);
  saveStorage();
  return pl;
}

function addTracksToPlaylist(playlistId, tracks) {
  const pl = state.data.playlists.find((p) => p.id === playlistId);
  if (!pl) return 0;
  let added = 0;
  for (const t of tracks) {
    if (!pl.tracks.some((ex) => ex.id === t.id)) {
      pl.tracks.push(t);
      added++;
    }
  }
  saveStorage();
  return added;
}

function removeTrackFromPlaylist(playlistId, trackId) {
  const pl = state.data.playlists.find((p) => p.id === playlistId);
  if (!pl) return;
  pl.tracks = pl.tracks.filter((t) => t.id !== trackId);
  saveStorage();
  toast('Şarkı listeden kaldırıldı');
  renderView();
}

function deletePlaylist(playlistId) {
  state.data.playlists = state.data.playlists.filter((p) => p.id !== playlistId);
  saveStorage();
  toast('Çalma listesi silindi');
  state.subview = null;
  renderView();
}

/* ------------------------------------------------------------ OYNATICI ARAYÜZÜ */
function updatePlayerUI() {
  const cur = state.cur;
  $('#miniPlayer').classList.toggle('hidden', !cur);
  if (!cur) return;

  const liked = isFavorite(cur.id);
  const coverHTML = cur.thumb
    ? `<img src="${esc(cur.thumb)}" alt="">`
    : `<div style="width:100%;height:100%;display:grid;place-items:center;color:var(--purple)">${ic('music')}</div>`;

  $('#miniCover').innerHTML = coverHTML;
  $('#miniTitle').textContent = cur.title;
  $('#miniArtist').textContent = cur.artist;
  $('#miniFavBtn').innerHTML = ic(liked ? 'heartf' : 'heart', 'sm');
  $('#miniFavBtn').classList.toggle('liked', liked);
  $('#miniPlayBtn').innerHTML = ic(state.playing ? 'pause' : 'play', 'sm');

  $('#npContextTitle').textContent = state.contextName;
  $('#npArtImg').innerHTML = coverHTML;
  $('#npSourceChip').textContent = cur.source === 'youtube' ? 'YouTube Resmi Oynatıcı' : '30 sn Önizleme (YouTube API için Ayarlar)';
  $('#npTitle').textContent = cur.title;
  $('#npArtist').textContent = cur.artist;
  $('#npFavBtn').innerHTML = ic(liked ? 'heartf' : 'heart');
  $('#npFavBtn').classList.toggle('liked', liked);
  $('#npPlayBtn').innerHTML = ic(state.playing ? 'pause' : 'play', 'lg');
  $('#npShuffleBtn').classList.toggle('on', state.shuffle);
  $('#npRepeatBtn').innerHTML = ic(state.repeat === 'one' ? 'repeat1' : 'repeat');
  $('#npRepeatBtn').classList.toggle('on', state.repeat !== 'off');
  $('#npVideoToggle').classList.toggle('hidden', cur.source !== 'youtube');
  $('#npVideoToggle').classList.toggle('active', state.videoMode);

  renderQueuePanel();
}

function updateProgressUI() {
  const dur = Math.max(1, state.dur || state.cur?.duration || 1);
  const pct = Math.min(100, Math.max(0, (state.pos / dur) * 100));
  $('#miniProgressFill').style.width = `${pct}%`;
  if (!state.seeking) {
    $('#npSeek').value = String(Math.round(pct * 10));
  }
  $('#npTimeCur').textContent = fmtSec(state.pos);
  $('#npTimeDur').textContent = fmtSec(state.dur || state.cur?.duration || 0);
  syncLyricHighlight();
}

function syncVideoDock() {
  const dock = $('#ytDock');
  const stage = $('#npStage');
  const artCard = $('#npArtCard');
  const showStageVideo = state.npOpen && state.videoMode && state.cur?.source === 'youtube';

  if (showStageVideo) {
    artCard.classList.add('hidden');
    if (dock.parentElement !== stage) stage.appendChild(dock);
    dock.classList.remove('hidden-dock');
    dock.classList.add('stage-dock');
  } else {
    artCard.classList.remove('hidden');
    if (dock.parentElement !== document.body) document.body.appendChild(dock);
    dock.classList.remove('stage-dock');
    dock.classList.add('hidden-dock');
  }
}

function openNowPlaying() {
  if (!state.cur) return;
  state.npOpen = true;
  $('#npSheet').classList.add('open');
  $('#npSheet').setAttribute('aria-hidden', 'false');
  syncVideoDock();
  renderQueuePanel();
}

function closeNowPlaying() {
  state.npOpen = false;
  $('#npSheet').classList.remove('open');
  $('#npSheet').setAttribute('aria-hidden', 'true');
  syncVideoDock();
}

function renderQueuePanel() {
  const panel = $('#npQueuePanel');
  if (!panel) return;
  if (!state.queue.length) {
    panel.innerHTML = '<div class="lyrics-empty">Sırada şarkı yok.</div>';
    return;
  }
  panel.innerHTML = `<div class="track-list">${state.queue
    .map(
      (t, idx) => `
      <div class="track-row ${idx === state.qi ? 'playing' : ''}" data-q-idx="${idx}">
        <button class="track-main" type="button">
          <div class="track-thumb">${t.thumb ? `<img src="${esc(t.thumb)}" alt="">` : ''}</div>
          <div class="track-info">
            <div class="track-name">${esc(t.title)}</div>
            <div class="track-artist">${esc(t.artist)}</div>
          </div>
        </button>
      </div>`
    )
    .join('')}</div>`;
  panel.querySelectorAll('.track-row').forEach((row) => {
    row.addEventListener('click', () => {
      const idx = parseInt(row.dataset.qIdx, 10);
      playTrack(state.queue[idx], state.queue, idx, state.contextName);
    });
  });
}

function renderActiveTrackHighlight() {
  $$('.track-row[data-track-id]').forEach((row) => {
    row.classList.toggle('playing', row.dataset.trackId === state.cur?.id);
  });
}

/* ------------------------------------------------------------ NAVİGASYON & GÖRÜNÜMLER */
function switchTab(tab) {
  state.tab = tab;
  state.subview = null;
  $$('.tab-item').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  renderView();
}

function openPlaylist(id) {
  state.tab = 'library';
  state.subview = { type: 'playlist', id };
  $$('.tab-item').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'library'));
  renderView();
}

function openSpecialList(type) {
  state.tab = 'library';
  state.subview = { type };
  $$('.tab-item').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'library'));
  renderView();
}

function updateHeaderBadge() {
  const hasYt = Boolean(state.data.settings.youtubeApiKey.trim());
  $('#modeBadge').textContent = hasYt ? 'YouTube Resmi Mod Aktif' : 'Önizleme + YouTube Link';
  $('#headerBack').classList.toggle('hidden', !state.subview);
}

function renderView() {
  updateHeaderBadge();
  const root = $('#viewContainer');
  root.scrollTop = 0;

  if (state.subview) {
    renderCollectionDetail(root, state.subview);
    return;
  }

  if (state.tab === 'home') renderHome(root);
  else if (state.tab === 'search') renderSearch(root);
  else if (state.tab === 'scan') renderScanner(root);
  else if (state.tab === 'library') renderLibrary(root);
}

function greetingText() {
  const h = new Date().getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

function renderHome(root) {
  const favCount = state.data.favorites.length;
  const pls = state.data.playlists;
  const recent = state.data.history.slice(0, 10);

  const quickItems = [
    {
      title: `Beğenilen Şarkılar (${favCount})`,
      grad: true,
      icon: 'heartf',
      act: () => openSpecialList('favorites')
    },
    ...pls.slice(0, 3).map((p) => ({
      title: p.name,
      thumb: p.tracks[0]?.thumb || '',
      icon: 'music',
      act: () => openPlaylist(p.id)
    }))
  ];

  root.innerHTML = `
    <h1 class="hero-greeting">${greetingText()}</h1>

    <div class="scan-hero-card">
      <div class="scan-hero-copy">
        <h2>Fotoğraflardan Çalma Listesi</h2>
        <p>Birden fazla ekran görüntüsü yükle, şarkı adlarını otomatik bulup listene ekleyelim.</p>
      </div>
      <button class="scan-hero-btn" id="homeOpenScanBtn" type="button">Fotoğraf Tara</button>
    </div>

    <div class="quick-link-box">
      <div class="quick-link-label">${ic('link', 'xs')} YouTube Video veya Liste Linki Yapıştır</div>
      <div class="quick-link-row">
        <input id="homeYtLinkInput" type="url" placeholder="https://youtu.be/... veya playlist linki">
        <button id="homeYtLinkBtn" type="button">Aç</button>
      </div>
    </div>

    <div class="quick-grid" id="homeQuickGrid">
      ${quickItems
        .map(
          (item, i) => `
        <button class="quick-card" data-qcard="${i}" type="button">
          <div class="quick-thumb ${item.grad ? 'fav-grad' : ''}">
            ${item.thumb ? `<img src="${esc(item.thumb)}" alt="">` : ic(item.icon)}
          </div>
          <div class="quick-title">${esc(item.title)}</div>
        </button>`
        )
        .join('')}
    </div>

    ${
      recent.length
        ? `
      <div class="section-head">
        <h2 class="section-title">Son Dinlediklerin</h2>
        <button class="section-link" id="homeAllHistory" type="button">Tümünü gör</button>
      </div>
      <div class="h-scroll" id="homeRecentRow">
        ${recent
          .map(
            (t, idx) => `
          <button class="album-card" data-recent-idx="${idx}" type="button">
            <div class="album-cover">
              ${t.thumb ? `<img src="${esc(t.thumb)}" alt="">` : ''}
              <span class="album-play-fab">${ic('play', 'sm')}</span>
            </div>
            <div class="album-name">${esc(t.title)}</div>
            <div class="album-sub">${esc(t.artist)}</div>
          </button>`
          )
          .join('')}
      </div>`
        : ''
    }

    <div class="section-head">
      <h2 class="section-title">Türlere Göre Keşfet</h2>
    </div>
    <div class="genre-grid">
      ${GENRES.map(
        (g) => `
        <button class="genre-card" data-genre-q="${esc(g.q)}" style="background:linear-gradient(135deg, ${g.c}, #111118)" type="button">
          <span>${esc(g.n)}</span>
          <div class="genre-emoji">${g.e}</div>
        </button>`
      ).join('')}
    </div>
  `;

  $('#homeOpenScanBtn').addEventListener('click', () => switchTab('scan'));
  $('#homeYtLinkBtn').addEventListener('click', async () => {
    const val = $('#homeYtLinkInput').value.trim();
    if (!val) return toast('Bir YouTube bağlantısı yapıştırın.');
    try {
      await importYouTubeLink(val);
      $('#homeYtLinkInput').value = '';
    } catch (err) {
      toast(err.message);
    }
  });

  quickItems.forEach((item, i) => {
    root.querySelector(`[data-qcard="${i}"]`)?.addEventListener('click', item.act);
  });

  $('#homeAllHistory')?.addEventListener('click', () => openSpecialList('history'));
  root.querySelectorAll('[data-recent-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.recentIdx, 10);
      playTrack(recent[idx], recent, idx, 'Son Dinlenenler');
    });
  });

  root.querySelectorAll('[data-genre-q]').forEach((el) => {
    el.addEventListener('click', () => {
      state.searchQuery = el.dataset.genreQ;
      switchTab('search');
      runSearch(state.searchQuery);
    });
  });
}

/* ------------------------------------------------------------ ARAMA GÖRÜNÜMÜ */
function renderSearch(root) {
  const hasYt = Boolean(state.data.settings.youtubeApiKey.trim());
  root.innerHTML = `
    <div class="search-bar-wrap">
      ${ic('search', 'sm')}
      <input id="searchInput" type="search" value="${esc(state.searchQuery)}" placeholder="Şarkı, sanatçı veya YouTube linki ara...">
      ${state.searchQuery ? `<button id="searchClearBtn" type="button">${ic('x', 'sm')}</button>` : ''}
    </div>

    <div class="search-chips">
      <button class="chip ${state.searchSource === 'auto' ? 'active' : ''}" data-src="auto" type="button">Otomatik</button>
      <button class="chip ${state.searchSource === 'youtube' ? 'active' : ''}" data-src="youtube" type="button">YouTube (Tam Şarkı)</button>
      <button class="chip ${state.searchSource === 'itunes' ? 'active' : ''}" data-src="itunes" type="button">Hızlı Önizleme (Anahtarsız)</button>
    </div>

    ${
      !hasYt
        ? `<div class="info-banner">
            <div>Tam uzunlukta resmi YouTube araması ve video klipler için Ayarlar'dan ücretsiz <strong>YouTube Data API v3</strong> anahtarını ekleyebilirsin. Şu an anahtarsız önizleme veya doğrudan YouTube linki kullanabilirsin.</div>
            <button id="searchAddYtKeyBtn" type="button">API Ekle</button>
          </div>`
        : ''
    }

    <div id="searchBody">
      ${
        state.searchLoading
          ? '<div class="empty-state"><h3>Aranıyor...</h3><p>Şarkılar getiriliyor.</p></div>'
          : state.searchResults.length
            ? renderTrackRowsHTML(state.searchResults, { context: 'search' })
            : `<div class="empty-state">
                <h3>Ne dinlemek istersin?</h3>
                <p>Şarkı adı yazıp Enter'a bas veya doğrudan bir YouTube linki yapıştır.</p>
              </div>`
      }
    </div>
  `;

  const input = $('#searchInput');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch(input.value);
    }
  });
  $('#searchClearBtn')?.addEventListener('click', () => {
    state.searchQuery = '';
    state.searchResults = [];
    renderView();
  });
  $('#searchAddYtKeyBtn')?.addEventListener('click', openSettingsModal);

  root.querySelectorAll('[data-src]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.searchSource = chip.dataset.src;
      if (state.searchQuery.trim()) runSearch(state.searchQuery);
      else renderView();
    });
  });

  wireTrackRows(root, state.searchResults, `Arama: ${state.searchQuery || 'Sonuçlar'}`);
}

async function runSearch(query) {
  const q = String(query || '').trim();
  state.searchQuery = q;
  if (!q) return;

  if (extractYouTubeId(q) || extractYouTubePlaylistId(q)) {
    try {
      await importYouTubeLink(q);
    } catch (err) {
      toast(err.message);
    }
    return;
  }

  state.searchLoading = true;
  renderView();
  try {
    state.searchResults = await smartSearch(q, 15);
    if (!state.searchResults.length) toast('Sonuç bulunamadı.');
  } catch (err) {
    toast(err.message);
    if (state.searchSource === 'youtube') {
      state.searchResults = [];
    }
  } finally {
    state.searchLoading = false;
    if (state.tab === 'search') renderView();
  }
}

/* ------------------------------------------------------------ ÇOKLU FOTOĞRAF TARAYICI */
function renderScanner(root) {
  const sc = state.scanner;
  const hasGemini = Boolean(state.data.settings.geminiApiKey.trim());
  const hasYt = Boolean(state.data.settings.youtubeApiKey.trim());
  const selectedCount = sc.detected.filter((d) => d.checked && d.title.trim()).length;

  root.innerHTML = `
    <div class="scanner-hero">
      <h1>Çoklu Fotoğraftan Liste Oluştur</h1>
      <p>Spotify, YouTube veya notlarındaki şarkı listesi ekran görüntülerinden <strong>birden fazla fotoğraf</strong> seç. Uygulama şarkı adlarını okuyup otomatik arayarak çalma listene ekler.</p>

      <label class="upload-dropzone" id="scanDropzone" for="multiPhotoInput">
        <div class="upload-icon-ring">${ic('image')}</div>
        <div class="upload-title">Fotoğrafları Seç (1'den Fazla Seçilebilir)</div>
        <div class="upload-sub">PNG, JPG, WebP desteklenir • Birden fazla ekran görüntüsü ekleyebilirsin</div>
      </label>
      <input id="multiPhotoInput" type="file" accept="image/*" multiple class="hidden">
    </div>

    ${
      sc.files.length
        ? `
      <div class="section-head" style="margin-top:6px">
        <h2 class="section-title">Seçilen Fotoğraflar (${sc.files.length})</h2>
        <div style="display:flex;gap:8px">
          <label class="section-link" for="multiPhotoInput" style="cursor:pointer">+ Daha Fazla</label>
          <button class="section-link" id="clearPhotosBtn" style="color:var(--danger)" type="button">Temizle</button>
        </div>
      </div>

      <div class="photo-grid">
        ${sc.files
          .map(
            (f, idx) => `
          <div class="photo-card">
            <img src="${esc(f.url)}" alt="Fotoğraf ${idx + 1}">
            <span class="photo-idx">#${idx + 1}</span>
            <button class="photo-remove" data-rm-photo="${esc(f.id)}" type="button" aria-label="Kaldır">${ic('x', 'xs')}</button>
          </div>`
          )
          .join('')}
      </div>

      <div class="engine-row">
        <button class="engine-btn ${sc.engine === 'ocr' ? 'active' : ''}" data-engine="ocr" type="button">
          <span class="engine-name">Yerleşik OCR</span>
          <span class="engine-desc">Ücretsiz • API anahtarsız</span>
        </button>
        <button class="engine-btn ${sc.engine === 'gemini' ? 'active' : ''}" data-engine="gemini" type="button">
          <span class="engine-name">Gemini AI Tarama</span>
          <span class="engine-desc">${hasGemini ? 'Yüksek doğruluk • Hazır' : 'Ayarlar\'dan API anahtarı ekle'}</span>
        </button>
      </div>

      <button class="primary-btn full" id="startScanBtn" type="button" ${sc.scanning || sc.matching ? 'disabled' : ''}>
        ${ic('sparkle', 'sm')} ${sc.scanning ? 'Fotoğraflar Taranıyor...' : `${sc.files.length} Fotoğraftaki Şarkıları Bul`}
      </button>`
        : ''
    }

    ${
      sc.scanning || sc.matching || sc.progressMsg
        ? `
      <div class="progress-card">
        <div class="progress-head">
          <span>${esc(sc.progressMsg || 'İşleniyor...')}</span>
          <span>${sc.progressPct}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${sc.progressPct}%"></div>
        </div>
      </div>`
        : ''
    }

    ${
      sc.detected.length
        ? `
      <div class="detected-card">
        <div class="section-head" style="margin:0 0 10px">
          <h2 class="section-title">Bulunan Şarkılar (${selectedCount}/${sc.detected.length})</h2>
          <button class="section-link" id="addManualSongBtn" type="button">+ Satır Ekle</button>
        </div>

        <div id="detectedList">
          ${sc.detected
            .map(
              (item) => `
            <div class="detected-item" data-det-id="${esc(item.id)}">
              <input type="checkbox" class="detected-check" ${item.checked ? 'checked' : ''}>
              <div class="detected-inputs">
                <input class="song-input" type="text" value="${esc(item.title)}" placeholder="Şarkı adı">
                <input class="artist-input" type="text" value="${esc(item.artist)}" placeholder="Sanatçı (isteğe bağlı)">
                ${
                  item.status === 'matched'
                    ? `<div class="match-status ok">✓ Eşleşti: ${esc(item.matchedTrack.title)} — ${esc(item.matchedTrack.artist)}</div>`
                    : item.status === 'miss'
                      ? `<div class="match-status miss">! Bulunamadı (adı düzenleyip tekrar dene)</div>`
                      : ''
                }
              </div>
              <button class="row-btn" data-del-det="${esc(item.id)}" type="button" aria-label="Sil">${ic('trash', 'xs')}</button>
            </div>`
            )
            .join('')}
        </div>

        <div class="target-box">
          <div>
            <label class="field-label" for="scanTargetSelect">Hangi Çalma Listesine Eklensin?</label>
            <select class="select-input" id="scanTargetSelect">
              <option value="__new__" ${sc.targetPlaylistId === '__new__' ? 'selected' : ''}>+ Yeni Çalma Listesi Oluştur</option>
              ${state.data.playlists
                .map(
                  (p) =>
                    `<option value="${esc(p.id)}" ${sc.targetPlaylistId === p.id ? 'selected' : ''}>${esc(p.name)} (${p.tracks.length} şarkı)</option>`
                )
                .join('')}
            </select>
          </div>

          ${
            sc.targetPlaylistId === '__new__'
              ? `<div>
                  <label class="field-label" for="scanNewPlName">Yeni Liste Adı</label>
                  <input class="text-input" id="scanNewPlName" type="text" value="${esc(sc.newPlaylistName)}" placeholder="Liste adı...">
                </div>`
              : ''
          }

          <button class="primary-btn full" id="matchAndAddBtn" type="button" ${sc.matching || !selectedCount ? 'disabled' : ''}>
            ${ic('listPlus', 'sm')} ${
              sc.matching
                ? 'Şarkılar Aranıp Ekleniyor...'
                : `${selectedCount} Şarkıyı ${hasYt ? 'YouTube\'da' : 'Katalogda'} Bul ve Listeye Ekle`
            }
          </button>

          ${
            sc.lastCreatedPlaylistId
              ? `<button class="secondary-btn full" id="openScannedPlBtn" type="button" style="width:100%">Oluşturulan Listeyi Aç ve Dinle</button>`
              : ''
          }
        </div>
      </div>`
        : ''
    }
  `;

  // Çoklu dosya seçimi
  const fileInput = $('#multiPhotoInput');
  fileInput.addEventListener('change', (e) => {
    addScannerFiles(e.target.files);
    e.target.value = '';
  });

  // Sürükle-bırak (masaüstü/tablet için)
  const dz = $('#scanDropzone');
  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('dragover');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('dragover');
    addScannerFiles(e.dataTransfer?.files);
  });

  $('#clearPhotosBtn')?.addEventListener('click', () => {
    sc.files.forEach((f) => URL.revokeObjectURL(f.url));
    sc.files = [];
    sc.detected = [];
    sc.progressMsg = '';
    sc.progressPct = 0;
    sc.lastCreatedPlaylistId = null;
    renderView();
  });

  root.querySelectorAll('[data-rm-photo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.rmPhoto;
      const found = sc.files.find((f) => f.id === id);
      if (found) URL.revokeObjectURL(found.url);
      sc.files = sc.files.filter((f) => f.id !== id);
      renderView();
    });
  });

  root.querySelectorAll('[data-engine]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const eng = btn.dataset.engine;
      if (eng === 'gemini' && !state.data.settings.geminiApiKey.trim()) {
        toast('Gemini AI için Ayarlar\'dan API anahtarı eklemelisin.');
        openSettingsModal();
        return;
      }
      sc.engine = eng;
      renderView();
    });
  });

  $('#startScanBtn')?.addEventListener('click', runMultiImageScan);

  $('#addManualSongBtn')?.addEventListener('click', () => {
    sc.detected.push({
      id: `det_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      checked: true,
      title: '',
      artist: '',
      status: 'pending',
      matchedTrack: null
    });
    renderView();
  });

  root.querySelectorAll('.detected-item').forEach((row) => {
    const id = row.dataset.detId;
    const item = sc.detected.find((d) => d.id === id);
    if (!item) return;
    row.querySelector('.detected-check').addEventListener('change', (e) => {
      item.checked = e.target.checked;
      renderView();
    });
    row.querySelector('.song-input').addEventListener('input', (e) => {
      item.title = e.target.value;
    });
    row.querySelector('.artist-input').addEventListener('input', (e) => {
      item.artist = e.target.value;
    });
    row.querySelector('[data-del-det]').addEventListener('click', () => {
      sc.detected = sc.detected.filter((d) => d.id !== id);
      renderView();
    });
  });

  $('#scanTargetSelect')?.addEventListener('change', (e) => {
    sc.targetPlaylistId = e.target.value;
    renderView();
  });
  $('#scanNewPlName')?.addEventListener('input', (e) => {
    sc.newPlaylistName = e.target.value;
  });
  $('#matchAndAddBtn')?.addEventListener('click', matchAndSaveDetectedSongs);
  $('#openScannedPlBtn')?.addEventListener('click', () => {
    if (sc.lastCreatedPlaylistId) openPlaylist(sc.lastCreatedPlaylistId);
  });
}

function addScannerFiles(fileList) {
  const incoming = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
  if (!incoming.length) return;
  for (const file of incoming) {
    state.scanner.files.push({
      id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      file,
      url: URL.createObjectURL(file)
    });
  }
  toast(`${incoming.length} fotoğraf eklendi (Toplam: ${state.scanner.files.length})`);
  renderView();
}

async function runMultiImageScan() {
  const sc = state.scanner;
  if (!sc.files.length || sc.scanning) return;

  sc.scanning = true;
  sc.progressPct = 5;
  sc.progressMsg = 'Tarama başlatılıyor...';
  sc.lastCreatedPlaylistId = null;
  renderView();

  const rawFiles = sc.files.map((f) => f.file);
  const onProgress = (pct, msg) => {
    sc.progressPct = pct;
    sc.progressMsg = msg;
    const bar = $('.progress-bar-fill');
    const head = $('.progress-head');
    if (bar && head) {
      bar.style.width = `${pct}%`;
      head.innerHTML = `<span>${esc(msg)}</span><span>${pct}%</span>`;
    }
  };

  try {
    let songs = [];
    if (sc.engine === 'gemini') {
      songs = await window.AnilityumScanner.scanImagesWithGemini(
        rawFiles,
        state.data.settings.geminiApiKey,
        onProgress
      );
    } else {
      songs = await window.AnilityumScanner.scanImagesWithTesseract(rawFiles, onProgress);
    }

    sc.detected = songs.map((s, idx) => ({
      id: `det_${Date.now()}_${idx}`,
      checked: true,
      title: s.title,
      artist: s.artist || '',
      status: 'pending',
      matchedTrack: null
    }));

    if (!songs.length) {
      toast('Fotoğraflarda net şarkı adı tespit edilemedi. Gemini AI modunu deneyebilirsin.');
    } else {
      toast(`${songs.length} şarkı bulundu! İnceleyip listeye ekleyebilirsin.`);
    }
  } catch (err) {
    toast(err.message || 'Tarama sırasında hata oluştu.');
    sc.progressMsg = `Hata: ${err.message}`;
  } finally {
    sc.scanning = false;
    if (state.tab === 'scan') renderView();
  }
}

async function matchAndSaveDetectedSongs() {
  const sc = state.scanner;
  const targets = sc.detected.filter((d) => d.checked && d.title.trim());
  if (!targets.length || sc.matching) return;

  sc.matching = true;
  sc.progressPct = 0;
  sc.progressMsg = 'Şarkılar aranıyor...';
  renderView();

  const matchedTracks = [];
  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    const query = `${item.artist ? `${item.artist} ` : ''}${item.title}`.trim();
    sc.progressPct = Math.round(((i + 1) / targets.length) * 100);
    sc.progressMsg = `Eşleştiriliyor (${i + 1}/${targets.length}): ${item.title}`;

    const bar = $('.progress-bar-fill');
    const head = $('.progress-head');
    if (bar && head) {
      bar.style.width = `${sc.progressPct}%`;
      head.innerHTML = `<span>${esc(sc.progressMsg)}</span><span>${sc.progressPct}%</span>`;
    }

    try {
      const found = await smartSearch(query, 3);
      if (found.length) {
        item.matchedTrack = found[0];
        item.status = 'matched';
        matchedTracks.push(found[0]);
      } else {
        item.status = 'miss';
      }
    } catch {
      item.status = 'miss';
    }
  }

  let targetId = sc.targetPlaylistId;
  if (matchedTracks.length) {
    if (targetId === '__new__') {
      const pl = createPlaylist(sc.newPlaylistName || defaultScanPlaylistName(), matchedTracks);
      targetId = pl.id;
    } else {
      addTracksToPlaylist(targetId, matchedTracks);
    }
    sc.lastCreatedPlaylistId = targetId;
    toast(`${matchedTracks.length} şarkı çalma listesine eklendi!`);
  } else {
    toast('Hiçbir şarkı eşleştirilemedi.');
  }

  sc.matching = false;
  sc.progressMsg = `${matchedTracks.length} / ${targets.length} şarkı eşleşti ve listeye eklendi.`;
  if (state.tab === 'scan') renderView();
}

/* ------------------------------------------------------------ KİTAPLIK & DETAY */
function renderLibrary(root) {
  const favs = state.data.favorites;
  const hist = state.data.history;
  const pls = state.data.playlists;

  root.innerHTML = `
    <div class="section-head" style="margin-top:0">
      <h1 class="hero-greeting" style="margin:0">Kitaplığın</h1>
      <button class="primary-btn" id="libNewPlBtn" style="padding:9px 14px;font-size:13px" type="button">
        ${ic('plus', 'xs')} Yeni Liste
      </button>
    </div>

    <div class="lib-card-list">
      <button class="lib-card" id="libFavCard" type="button">
        <div class="lib-art fav">${ic('heartf')}</div>
        <div class="lib-meta">
          <div class="lib-name">Beğenilen Şarkılar</div>
          <div class="lib-sub">${favs.length} şarkı</div>
        </div>
      </button>

      <button class="lib-card" id="libHistCard" type="button">
        <div class="lib-art hist">${ic('clock')}</div>
        <div class="lib-meta">
          <div class="lib-name">Son Dinlenenler</div>
          <div class="lib-sub">${hist.length} şarkı</div>
        </div>
      </button>

      ${pls
        .map(
          (p) => `
        <button class="lib-card" data-open-pl="${esc(p.id)}" type="button">
          <div class="lib-art">
            ${p.tracks[0]?.thumb ? `<img src="${esc(p.tracks[0].thumb)}" alt="">` : ic('music')}
          </div>
          <div class="lib-meta">
            <div class="lib-name">${esc(p.name)}</div>
            <div class="lib-sub">Çalma Listesi • ${p.tracks.length} şarkı</div>
          </div>
        </button>`
        )
        .join('')}
    </div>

    ${
      !pls.length
        ? `<div class="empty-state">
            <h3>Henüz özel çalma listen yok</h3>
            <p>"Yeni Liste" oluşturabilir veya "Tara" sekmesinden fotoğraflardaki şarkılarını otomatik listeye dönüştürebilirsin.</p>
          </div>`
        : ''
    }
  `;

  $('#libNewPlBtn').addEventListener('click', () => openModal('createPlaylistModal'));
  $('#libFavCard').addEventListener('click', () => openSpecialList('favorites'));
  $('#libHistCard').addEventListener('click', () => openSpecialList('history'));
  root.querySelectorAll('[data-open-pl]').forEach((el) => {
    el.addEventListener('click', () => openPlaylist(el.dataset.openPl));
  });
}

function renderCollectionDetail(root, sub) {
  let title = '';
  let subtitle = '';
  let tracks = [];
  let artHTML = ic('music', 'lg');
  let isCustom = false;

  if (sub.type === 'favorites') {
    title = 'Beğenilen Şarkılar';
    tracks = state.data.favorites;
    subtitle = `${tracks.length} favori şarkı`;
    artHTML = ic('heartf', 'lg');
  } else if (sub.type === 'history') {
    title = 'Son Dinlenenler';
    tracks = state.data.history;
    subtitle = `${tracks.length} şarkı`;
    artHTML = ic('clock', 'lg');
  } else if (sub.type === 'playlist') {
    const pl = state.data.playlists.find((p) => p.id === sub.id);
    if (!pl) {
      state.subview = null;
      return renderView();
    }
    isCustom = true;
    title = pl.name;
    tracks = pl.tracks;
    subtitle = `Çalma Listesi • ${tracks.length} şarkı`;
    if (tracks[0]?.thumb) artHTML = `<img src="${esc(tracks[0].thumb)}" alt="">`;
  }

  root.innerHTML = `
    <div class="playlist-hero">
      <div class="playlist-hero-art">${artHTML}</div>
      <h1>${esc(title)}</h1>
      <p>${esc(subtitle)}</p>
      <div class="playlist-hero-actions">
        ${
          tracks.length
            ? `<button class="primary-btn" id="detailPlayAllBtn" type="button">${ic('play', 'sm')} Tümünü Çal</button>`
            : ''
        }
        ${
          isCustom
            ? `<button class="secondary-btn" id="detailAddPhotoBtn" type="button">${ic('camera', 'xs')} Fotoğraftan Ekle</button>
               <button class="secondary-btn" id="detailDeletePlBtn" style="color:var(--danger)" type="button">${ic('trash', 'xs')} Sil</button>`
            : ''
        }
      </div>
    </div>

    ${
      tracks.length
        ? renderTrackRowsHTML(tracks, { playlistId: isCustom ? sub.id : null })
        : `<div class="empty-state">
            <h3>Bu liste henüz boş</h3>
            <p>Aramadan şarkı ekleyebilir veya fotoğraflardan otomatik şarkı tarayabilirsin.</p>
          </div>`
    }
  `;

  $('#detailPlayAllBtn')?.addEventListener('click', () => {
    playTrack(tracks[0], tracks, 0, title);
    openNowPlaying();
  });
  $('#detailAddPhotoBtn')?.addEventListener('click', () => {
    state.scanner.targetPlaylistId = sub.id;
    switchTab('scan');
  });
  $('#detailDeletePlBtn')?.addEventListener('click', () => {
    if (confirm(`"${title}" çalma listesi silinsin mi?`)) {
      deletePlaylist(sub.id);
    }
  });

  wireTrackRows(root, tracks, title, isCustom ? sub.id : null);
}

/* ------------------------------------------------------------ ORTAK ŞARKI SATIRI */
function renderTrackRowsHTML(tracks, opts = {}) {
  return `<div class="track-list">${tracks
    .map((t, idx) => {
      const liked = isFavorite(t.id);
      const badge = t.source === 'youtube' ? 'YT' : '30s';
      return `
      <div class="track-row ${state.cur?.id === t.id ? 'playing' : ''}" data-track-idx="${idx}" data-track-id="${esc(t.id)}">
        <button class="track-main" type="button">
          <div class="track-thumb">
            ${t.thumb ? `<img src="${esc(t.thumb)}" loading="lazy" alt="">` : ''}
            <span class="track-badge">${badge}</span>
          </div>
          <div class="track-info">
            <div class="track-name">${esc(t.title)}</div>
            <div class="track-artist">${esc(t.artist)}${t.duration ? ` • ${fmtSec(t.duration)}` : ''}</div>
          </div>
        </button>
        <div class="track-actions">
          <button class="row-btn ${liked ? 'liked' : ''}" data-act-fav="${idx}" aria-label="Favori" type="button">
            ${ic(liked ? 'heartf' : 'heart', 'sm')}
          </button>
          <button class="row-btn" data-act-pl="${idx}" aria-label="Listeye ekle" type="button">
            ${ic('listPlus', 'sm')}
          </button>
          ${
            opts.playlistId
              ? `<button class="row-btn" data-act-rm="${esc(t.id)}" aria-label="Listeden kaldır" type="button">${ic('trash', 'xs')}</button>`
              : ''
          }
        </div>
      </div>`;
    })
    .join('')}</div>`;
}

function wireTrackRows(root, tracks, contextName, playlistId = null) {
  root.querySelectorAll('.track-row[data-track-idx]').forEach((row) => {
    const idx = parseInt(row.dataset.trackIdx, 10);
    const track = tracks[idx];
    row.querySelector('.track-main')?.addEventListener('click', () => {
      playTrack(track, tracks, idx, contextName);
    });
    row.querySelector('[data-act-fav]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(track);
    });
    row.querySelector('[data-act-pl]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddToPlaylistModal(track);
    });
    row.querySelector('[data-act-rm]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (playlistId) removeTrackFromPlaylist(playlistId, track.id);
    });
  });
}

/* ------------------------------------------------------------ MODALLAR */
function openModal(id) {
  $(`#${id}`)?.classList.add('open');
}

function closeModal(id) {
  $(`#${id}`)?.classList.remove('open');
}

function openAddToPlaylistModal(track) {
  if (!track) return;
  state.playlistModalTrack = track;
  const body = $('#playlistModalBody');
  const pls = state.data.playlists;

  body.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <input class="text-input" id="quickPlName" style="margin:0" type="text" placeholder="Yeni liste adı yaz ve ekle...">
      <button class="primary-btn" id="quickPlCreateBtn" style="flex-shrink:0;padding:10px 14px" type="button">Oluştur</button>
    </div>
    <div class="lib-card-list">
      ${
        pls.length
          ? pls
              .map(
                (p) => `
          <button class="lib-card" data-pick-pl="${esc(p.id)}" type="button">
            <div class="lib-art">${p.tracks[0]?.thumb ? `<img src="${esc(p.tracks[0].thumb)}" alt="">` : ic('music')}</div>
            <div class="lib-meta">
              <div class="lib-name">${esc(p.name)}</div>
              <div class="lib-sub">${p.tracks.length} şarkı</div>
            </div>
          </button>`
              )
              .join('')
          : '<div class="lyrics-empty">Yukarıdan ilk çalma listeni oluşturabilirsin.</div>'
      }
    </div>
  `;

  $('#quickPlCreateBtn').addEventListener('click', () => {
    const name = $('#quickPlName').value.trim();
    if (!name) return toast('Liste adı yazın.');
    createPlaylist(name, [track]);
    toast(`"${name}" oluşturuldu ve şarkı eklendi!`);
    closeModal('playlistModal');
    if (state.tab === 'library') renderView();
  });

  body.querySelectorAll('[data-pick-pl]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const added = addTracksToPlaylist(btn.dataset.pickPl, [track]);
      toast(added ? 'Çalma listesine eklendi!' : 'Bu şarkı zaten bu listede.');
      closeModal('playlistModal');
      if (state.tab === 'library') renderView();
    });
  });

  openModal('playlistModal');
}

function openSettingsModal() {
  const body = $('#settingsModalBody');
  const s = state.data.settings;

  body.innerHTML = `
    <div class="settings-card">
      <h4>YouTube Data API v3 Anahtarı (Önerilen)</h4>
      <p>Resmi YouTube araması ve tam uzunlukta video/müzik oynatma için Google Cloud Console'dan ücretsiz YouTube Data API v3 anahtarı alıp buraya yapıştır. Oynatma resmi YouTube Player üzerinden çalışır.</p>
      <input class="text-input" id="setYtKey" type="password" value="${esc(s.youtubeApiKey)}" placeholder="AIzaSy...">
    </div>

    <div class="settings-card">
      <h4>Gemini API Anahtarı (İsteğe Bağlı — Yüksek Doğruluklu Fotoğraf Tarama)</h4>
      <p>Fotoğraflardaki şarkı listelerini yapay zeka (<code>gemini-3.8-flash</code>) ile çok daha yüksek doğrulukla okumak için Google AI Studio'dan ücretsiz anahtar ekleyebilirsin. Anahtar olmadan da yerleşik OCR çalışır.</p>
      <input class="text-input" id="setGeminiKey" type="password" value="${esc(s.geminiApiKey)}" placeholder="AIzaSy...">
    </div>

    <button class="primary-btn full" id="saveSettingsBtn" type="button" style="margin-bottom:14px">Ayarları Kaydet</button>

    <div class="settings-card">
      <h4>Kitaplık Yedekleme</h4>
      <p>Favorilerin ve tüm çalma listelerin cihazında yerel olarak saklanır. JSON olarak dışa aktarabilir veya geri yükleyebilirsin.</p>
      <div class="settings-btn-row">
        <button class="secondary-btn" id="exportLibBtn" type="button">JSON Dışa Aktar</button>
        <label class="secondary-btn" for="importLibInput" style="cursor:pointer">JSON İçe Aktar</label>
        <input id="importLibInput" type="file" accept="application/json" class="hidden">
      </div>
    </div>
  `;

  $('#saveSettingsBtn').addEventListener('click', () => {
    state.data.settings.youtubeApiKey = $('#setYtKey').value.trim();
    state.data.settings.geminiApiKey = $('#setGeminiKey').value.trim();
    saveStorage();
    updateHeaderBadge();
    toast('Ayarlar kaydedildi!');
    closeModal('settingsModal');
    renderView();
  });

  $('#exportLibBtn').addEventListener('click', () => {
    const payload = {
      favorites: state.data.favorites,
      playlists: state.data.playlists,
      history: state.data.history
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'anilityumpar-kitaplik.json';
    a.click();
    toast('Kitaplık dışa aktarıldı!');
  });

  $('#importLibInput').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (Array.isArray(imported.favorites)) state.data.favorites = imported.favorites;
      if (Array.isArray(imported.playlists)) state.data.playlists = imported.playlists;
      if (Array.isArray(imported.history)) state.data.history = imported.history;
      saveStorage();
      toast('Kitaplık içe aktarıldı!');
      closeModal('settingsModal');
      renderView();
    } catch {
      toast('Geçersiz JSON dosyası.');
    }
  });

  openModal('settingsModal');
}

/* ------------------------------------------------------------ BAŞLANGIÇ */
function boot() {
  // Statik ikonları doldur
  $('#headerBack').innerHTML = ic('chevL');
  $('#btnQuickScan').innerHTML = ic('camera', 'sm');
  $('#btnSettings').innerHTML = ic('settings', 'sm');
  $('#npCloseBtn').innerHTML = ic('chevD');
  $('#npVideoToggle').innerHTML = ic('video', 'sm');
  $('#npAddPlaylistBtn').innerHTML = ic('listPlus', 'sm');
  $('#npShuffleBtn').innerHTML = ic('shuffle');
  $('#npPrevBtn').innerHTML = ic('prev');
  $('#npPlayBtn').innerHTML = ic('play', 'lg');
  $('#npNextBtn').innerHTML = ic('next');
  $('#npRepeatBtn').innerHTML = ic('repeat');
  $$('[data-icon]').forEach((el) => {
    el.innerHTML = ic(el.dataset.icon);
  });
  $$('.modal-close').forEach((btn) => {
    btn.innerHTML = ic('x', 'sm');
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  $$('.modal-overlay').forEach((ov) => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) ov.classList.remove('open');
    });
  });

  // Üst bar & sekmeler
  $('#headerBack').addEventListener('click', () => {
    state.subview = null;
    renderView();
  });
  $('#btnQuickScan').addEventListener('click', () => switchTab('scan'));
  $('#btnSettings').addEventListener('click', openSettingsModal);
  $$('.tab-item').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Mini oynatıcı & Tam ekran oynatıcı olayları
  $('#miniExpandBtn').addEventListener('click', openNowPlaying);
  $('#miniFavBtn').addEventListener('click', () => toggleFavorite(state.cur));
  $('#miniPlayBtn').addEventListener('click', togglePlay);
  $('#npCloseBtn').addEventListener('click', closeNowPlaying);
  $('#npFavBtn').addEventListener('click', () => toggleFavorite(state.cur));
  $('#npPlayBtn').addEventListener('click', togglePlay);
  $('#npNextBtn').addEventListener('click', nextTrack);
  $('#npPrevBtn').addEventListener('click', prevTrack);
  $('#npAddPlaylistBtn').addEventListener('click', () => openAddToPlaylistModal(state.cur));
  $('#npVideoToggle').addEventListener('click', () => {
    state.videoMode = !state.videoMode;
    $('#npVideoToggle').classList.toggle('active', state.videoMode);
    syncVideoDock();
  });
  $('#npShuffleBtn').addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    toast(state.shuffle ? 'Karıştırma açık' : 'Karıştırma kapalı');
    updatePlayerUI();
  });
  $('#npRepeatBtn').addEventListener('click', () => {
    state.repeat = state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off';
    toast(state.repeat === 'off' ? 'Tekrar kapalı' : state.repeat === 'all' ? 'Listeyi tekrarla' : 'Şarkıyı tekrarla');
    updatePlayerUI();
  });

  // Seek bar
  const seek = $('#npSeek');
  seek.addEventListener('input', () => {
    state.seeking = true;
    const dur = state.dur || state.cur?.duration || 0;
    $('#npTimeCur').textContent = fmtSec((parseFloat(seek.value) / 1000) * dur);
  });
  seek.addEventListener('change', () => {
    const dur = state.dur || state.cur?.duration || 0;
    seekTo((parseFloat(seek.value) / 1000) * dur);
    state.seeking = false;
  });

  // Now Playing alt sekmeleri (Sözler / Sıradakiler)
  $$('.np-subtab').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.npSubtab = btn.dataset.subtab;
      $$('.np-subtab').forEach((b) => b.classList.toggle('active', b === btn));
      $('#npLyricsPanel').classList.toggle('hidden', state.npSubtab !== 'lyrics');
      $('#npQueuePanel').classList.toggle('hidden', state.npSubtab !== 'queue');
    });
  });

  // Yeni çalma listesi modalı
  $('#confirmCreatePlaylistBtn').addEventListener('click', () => {
    const input = $('#newPlaylistName');
    const name = input.value.trim();
    if (!name) return toast('Lütfen bir liste adı yazın.');
    const pl = createPlaylist(name);
    input.value = '';
    closeModal('createPlaylistModal');
    toast(`"${pl.name}" oluşturuldu!`);
    openPlaylist(pl.id);
  });

  // PWA Service Worker
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  if (window.YT && window.YT.Player) {
    initYouTubePlayer();
  }

  renderView();
}

document.addEventListener('DOMContentLoaded', boot);
