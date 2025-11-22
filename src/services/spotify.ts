const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID!;
const REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin;

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-top-read',
  'playlist-read-private',
];

const TOKEN_KEY = 'spotify_access_token';
const TOKEN_EXP_KEY = 'spotify_expires_at';

export function getSpotifyAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'token',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Lee el access_token del hash de la URL luego del login
export function readTokenFromUrlHash(): string | null {
  if (!window.location.hash.startsWith('#')) return null;

  const hash = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hash.get('access_token');
  const expiresIn = hash.get('expires_in');

  if (accessToken) {
    const expiresAt =
      Date.now() + Number(expiresIn || '3600') * 1000; // default 1h

    window.localStorage.setItem(TOKEN_KEY, accessToken);
    window.localStorage.setItem(TOKEN_EXP_KEY, String(expiresAt));

    // Limpia el hash para no dejar el token visible
    window.location.hash = '';
    return accessToken;
  }

  return null;
}

export function getStoredToken(): string | null {
  const token = window.localStorage.getItem(TOKEN_KEY);
  const exp = window.localStorage.getItem(TOKEN_EXP_KEY);

  if (!token || !exp) return null;
  if (Date.now() > Number(exp)) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(TOKEN_EXP_KEY);
    return null;
  }
  return token;
}

// Tipos mínimos que necesitamos del API de Spotify
export interface SpotifyApiTrack {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

export interface SpotifyAudioFeatures {
  id: string;
  tempo: number | null;
  key: number | null;
  mode: number | null;
}

const KEY_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

function keyToName(key: number | null, mode: number | null): string {
  if (key == null || key < 0 || key > 11) return 'N/A';
  const base = KEY_NAMES[key];
  if (mode === 1) return `${base} major`;
  if (mode === 0) return `${base} minor`;
  return base;
}

// Devuelve tus top tracks + audio features (BPM, key, etc.)
export async function fetchUserTopTracksWithFeatures(
  token: string
): Promise<
  Array<{
    track: SpotifyApiTrack;
    features?: SpotifyAudioFeatures & { keyName: string };
  }>
> {
  const headers = { Authorization: `Bearer ${token}` };

  // 1) Top tracks del usuario
  const res = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
    headers,
  });
  if (!res.ok) throw new Error('Error fetching top tracks from Spotify');

  const json = await res.json();
  const items: SpotifyApiTrack[] = json.items || [];
  const ids = items.map((t) => t.id).join(',');

  let featuresById: Record<
    string,
    SpotifyAudioFeatures & { keyName: string }
  > = {};

  if (ids) {
    const res2 = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${ids}`,
      { headers }
    );

    if (res2.ok) {
      const json2 = await res2.json();
      for (const f of json2.audio_features || []) {
        if (!f) continue;
        const keyName = keyToName(f.key, f.mode);
        featuresById[f.id] = { ...f, keyName };
      }
    }
  }

  return items.map((track) => ({
    track,
    features: featuresById[track.id],
  }));
}
