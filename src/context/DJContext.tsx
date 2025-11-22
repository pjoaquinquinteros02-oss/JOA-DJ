import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  bpm: number;
  key: string;
  url: string; // In a real app, this is the audio source
}

export interface DeckState {
  track: Track | null;
  playing: boolean;
  volume: number;
  pitch: number; // 0 is normal, range -10 to +10 % typically, or playbackRate
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  gain: number;
  cuePoints: number[];
  loopIn: number | null;
  loopOut: number | null;
  currentTime: number;
}

interface DJContextType {
  deckA: DeckState;
  deckB: DeckState;
  crossfader: number; // 0 (A) to 100 (B)
  activeDeck: 'A' | 'B' | null;
  library: Track[];
  
  // Actions
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

// Mock Tracks
const MOCK_LIBRARY: Track[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1703115015343-81b498a8c080?w=300', duration: 243, bpm: 105, key: 'Bm', url: '/demo1.mp3' },
  { id: '2', title: 'One More Time', artist: 'Daft Punk', cover: 'https://images.unsplash.com/photo-1762352939776-da05be5784e5?w=300', duration: 320, bpm: 123, key: 'D', url: '/demo2.mp3' },
  { id: '3', title: 'Levels', artist: 'Avicii', cover: 'https://images.unsplash.com/photo-1631016558939-299d332fa5fe?w=300', duration: 198, bpm: 126, key: 'C#m', url: '/demo3.mp3' },
  { id: '4', title: 'Strobe', artist: 'Deadmau5', cover: 'https://images.unsplash.com/photo-1735896832573-9d62e11b2ba6?w=300', duration: 636, bpm: 128, key: 'Gm', url: '/demo4.mp3' },
  { id: '5', title: 'Titanium', artist: 'David Guetta', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300', duration: 245, bpm: 126, key: 'Eb', url: '/demo5.mp3' },
];

export const DJProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deckA, setDeckA] = useState<DeckState>(defaultDeckState);
  const [deckB, setDeckB] = useState<DeckState>(defaultDeckState);
  const [crossfader, setCrossfader] = useState(50);
  const [activeDeck, setActiveDeck] = useState<'A' | 'B' | null>(null);
  const [library, setLibrary] = useState<Track[]>([]);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  const connectSpotify = () => {
    // Simulate API delay
    setTimeout(() => {
      setIsSpotifyConnected(true);
      setLibrary(MOCK_LIBRARY);
    }, 1500);
  };

  const loadTrack = (deck: 'A' | 'B', track: Track) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState(prev => ({ ...prev, track, playing: false, currentTime: 0 }));
  };

  const togglePlay = (deck: 'A' | 'B') => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState(prev => ({ ...prev, playing: !prev.playing }));
  };

  const setVolume = (deck: 'A' | 'B', val: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState(prev => ({ ...prev, volume: val }));
  };

  const setPitch = (deck: 'A' | 'B', val: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState(prev => ({ ...prev, pitch: val }));
  };

  const setEq = (deck: 'A' | 'B', band: 'high' | 'mid' | 'low', val: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState(prev => ({ ...prev, eq: { ...prev.eq, [band]: val } }));
  };

  const setGain = (deck: 'A' | 'B', val: number) => {
    const setState = deck === 'A' ? setDeckA : setDeckB;
    setState(prev => ({ ...prev, gain: val }));
  };

  const updateTime = (deck: 'A' | 'B', time: number) => {
     const setState = deck === 'A' ? setDeckA : setDeckB;
    setState(prev => ({ ...prev, currentTime: time }));
  }

  return (
    <DJContext.Provider value={{
      deckA, deckB, crossfader, activeDeck, library,
      loadTrack, togglePlay, setVolume, setPitch, setEq, setGain, setCrossfader, updateTime,
      connectSpotify, isSpotifyConnected
    }}>
      {children}
    </DJContext.Provider>
  );
};

export const useDJ = () => {
  const context = useContext(DJContext);
  if (context === undefined) {
    throw new Error('useDJ must be used within a DJProvider');
  }
  return context;
};
