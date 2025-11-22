import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  getSpotifyAuthUrl,
  readTokenFromUrlHash,
  getStoredToken,
  fetchUserTopTracksWithFeatures,
} from '../services/spotify';

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number; // segundos
  bpm: number;
  key: string;
  url: string; // audio source (Spotify preview o archivo local)
}

export interface DeckState {
  track: Track | null;
  playing: boolean;
  volume: number; // 0 - 100
  pitch: number; // -100 a 100 (%)
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  gain: number;
  cuePoints: number[];
  loopIn: number | null;
  loopOut: number | null;
  currentTime: number; // segundos
}

interface DJContextType {
  deckA: DeckState;
  deckB: DeckState;
  crossfader: number; // 0 (A) a 100 (B)
  activeDeck: 'A' | 'B' | null;
  library: Track[];

  loadTrack: (deck: 'A' | 'B', track: Track) => void;
  togglePlay: (deck: 'A' | 'B') => void;
  setVolume: (deck: 'A' | 'B', val: number) => void;
  setPitch: (deck: 'A' | 'B', val: number) => void;
  setEq: (deck: 'A' | 'B', band: 'high' | 'mid' | 'low', val: number) => void;
  setGain: (deck: 'A' | 'B', val: number) => void;
  setCrossfader: (val: number) => void;
  updateTime: (deck: 'A' | 'B', time: number) => void;

  connectSpotify: () => void;
  isSpotifyConnected: boolean;
}

const defaultDeckState: DeckState = {
  track: null,
  playing: false,
  volume: 100,
  pitch: 0,
  eq: { high: 50, mid: 50, low: 50 },
  gain: 50,
  cuePoints: [],
  loopIn: null,
  loopOut: null,
  currentTime: 0,
};

const DJContext = createContext<DJContextType | undefined>(undefined);

// Librería mock de backup (por si no hay Spotify o para demos offline)
const MOCK_LIBRARY: Track[] = [
  {
    id: 'demo-1',
    title: 'Midnight City',
    artist: 'M83',
    cover: 'https://images.pexels.com/photos/167404/pexels-photo-167404.jpeg',
    duration: 243,
    bpm: 105,
    key: 'Bm',
    url: '/demo1.mp3',
  },
  {
    id: 'demo-2',
    title: 'One More Time',
    artist: 'Daft Punk',
    cover: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg',
    duration: 320,
    bpm: 123,
    key: 'D',
    url: '/demo2.mp3',
  },
];

export const DJProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deckA, setDeckA] = useState<DeckState>(defaultDeckState);
  const [deckB, setDeckB] = useState<DeckState>(defaultDeckState);
  const [crossfader, setCrossfader] = useState(50);
  const [activeDeck, setActiveDeck] = useState<'A' | 'B' | null>(null);
  const [library, setLibrary] = useState<Track[]>([]);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  // Al montar: leer token de la URL (callback de Spotify) o de localStorage
  useEffect(() => {
    const fromHash = readTokenFromUrlHash();
    if (fromHash) {
      setSpotifyToken(fromHash);
      setIsSpotifyConnected(true);
      return;
    }

    const stored = getStoredToken();
    if (stored) {
      setSpotifyToken(stored);
      setIsSpotifyConnected(true);
      return;
    }

    // Si no hay Spotify, usamos librería mock para que el UI no esté vacío
    setLibrary(MOCK_LIBRARY);
  }, []);

  const loadSpotifyLibrary = useCallback(
    async (token: string) => {
      try {
        const data = await fetchUserTopTracksWithFeatures(token);
        const mapped: Track[] = data
          .filter((item: any) => item.track.preview_url)
          .map((item: any) => ({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists.map((a: any) => a.name).join(', '),
            cover: item.track.album.images?.[0]?.url || '',
            duration: Math.round(item.track.duration_ms / 1000),
            bpm: item.features?.tempo ?? 120,
            key: item.features?.keyName ?? 'N/A',
            url: item.track.preview_url!,
          }));

        if (mapped.length > 0) {
          setLibrary(mapped);
        } else {
          // fallback a mock si el usuario no tiene previews disponibles
          setLibrary(MOCK_LIBRARY);
        }
      } catch (error) {
        console.error('Error loading Spotify library', error);
        setLibrary(MOCK_LIBRARY);
      }
    },
    []
  );

  // Cada vez que tengamos un token, cargamos la librería desde Spotify
  useEffect(() => {
    if (!spotifyToken) return;
    loadSpotifyLibrary(spotifyToken);
  }, [spotifyToken, loadSpotifyLibrary]);

  const connectSpotify = () => {
    const stored = getStoredToken();
    if (stored) {
      setSpotifyToken(stored);
      setIsSpotifyConnected(true);
      return;
    }

    const url = getSpotifyAuthUrl();
    window.location.href = url;
  };

  const loadTrack = (deck: 'A' | 'B', track: Track) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setActiveDeck(deck);
    setState((prev) => ({
      ...prev,
      track,
      playing: false,
      currentTime: 0,
    }));
  };

  const togglePlay = (deck: 'A' | 'B') => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setActiveDeck(deck);
    setState((prev) => ({ ...prev, playing: !prev.playing }));
  };

  const setVolume = (deck: 'A' | 'B', val: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState((prev) => ({ ...prev, volume: val }));
  };

  const setPitch = (deck: 'A' | 'B', val: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState((prev) => ({ ...prev, pitch: val }));
  };

  const setEq = (deck: 'A' | 'B', band: 'high' | 'mid' | 'low', val: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState((prev) => ({
      ...prev,
      eq: {
        ...prev.eq,
        [band]: val,
      },
    }));
  };

  const setGain = (deck: 'A' | 'B', val: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState((prev) => ({ ...prev, gain: val }));
  };

  const updateTime = (deck: 'A' | 'B', time: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState((prev) => ({ ...prev, currentTime: time }));
  };

  const value: DJContextType = {
    deckA,
    deckB,
    crossfader,
    activeDeck,
    library,
    loadTrack,
    togglePlay,
    setVolume,
    setPitch,
    setEq,
    setGain,
    setCrossfader,
    updateTime,
    connectSpotify,
    isSpotifyConnected,
  };

  return <DJContext.Provider value={value}>{children}</DJContext.Provider>;
};

export const useDJ = () => {
  const context = useContext(DJContext);
  if (context === undefined) {
    throw new Error('useDJ must be used within a DJProvider');
  }
  return context;
};
