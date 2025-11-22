import React, { useEffect, useRef } from 'react';
import { useDJ } from '../../context/DJContext';
import { Play, Pause, RotateCcw, Disc } from 'lucide-react';
import { Fader } from './Fader';

interface DeckProps {
  id: 'A' | 'B';
}

export const Deck: React.FC<DeckProps> = ({ id }) => {
  const {
    deckA,
    deckB,
    crossfader,
    togglePlay,
    setPitch,
    setVolume,
    updateTime,
  } = useDJ();

  const state = id === 'A' ? deckA : deckB;
  const color = id === 'A' ? 'text-cyan-400' : 'text-rose-500';
  const borderColor = id === 'A' ? 'border-cyan-400/30' : 'border-rose-500/30';
  const bgGlow =
    id === 'A'
      ? 'shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)]'
      : 'shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)]';

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Crear el elemento de audio una sola vez
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;
    }
  }, []);

  // Ganancia del crossfader aplicada a este deck
  const crossfaderGain =
    id === 'A' ? (100 - crossfader) / 100 : crossfader / 100;

  // Cuando cambia el track, cargar la URL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.track?.url) return;

    audio.src = state.track.url;
    audio.currentTime = 0;

    if (state.playing) {
      audio
        .play()
        .catch((err) => console.warn('Error playing audio on load', err));
    }
  }, [state.track?.id, state.playing]);

  // Play / pause en función del estado global
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.playing && state.track?.url) {
      audio
        .play()
        .catch((err) => console.warn('Error playing audio', err));
    } else {
      audio.pause();
    }
  }, [state.playing, state.track?.url]);

  // Volumen y pitch (playbackRate) + crossfader
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const baseVolume = state.volume / 100;
    audio.volume = Math.max(
      0,
      Math.min(1, baseVolume * crossfaderGain)
    );

    audio.playbackRate = 1 + state.pitch / 100;
  }, [state.volume, state.pitch, crossfaderGain]);

  // Sincronizar currentTime del contexto con el audio real
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      updateTime(id, audio.currentTime);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [id, updateTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(2, '0')}`;
  };

  const rotation = (state.currentTime * 360) % 360;

  return (
    <div
      className={`flex flex-col h-full bg-[#18181b] border ${borderColor} rounded-xl p-4 relative overflow-hidden ${bgGlow}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <h2 className={`text-2xl font-black tracking-tighter ${color}`}>
            DECK {id}
          </h2>
          {state.track ? (
            <div className="mt-1">
              <div className="text-white font-bold truncate max-w-[200px]">
                {state.track.title}
              </div>
              <div className="text-muted-foreground text-sm truncate max-w-[200px]">
                {state.track.artist}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">
              Load a track from the library
            </p>
          )}
        </div>

        {state.track && (
          <div className="flex flex-col items-end text-xs text-muted-foreground">
            <span>BPM: {state.track.bpm}</span>
            <span>Key: {state.track.key}</span>
          </div>
        )}
      </div>

      {/* Jog wheel + info */}
      <div className="flex gap-4">
        <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-4 rounded-full border border-white/10 flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.1s linear',
            }}
          >
            <Disc className="w-8 h-8 text-white/80" />
          </div>
          {state.track && (
            <img
              src={state.track.cover}
              alt={state.track.title}
              className="absolute inset-6 rounded-full object-cover opacity-20"
            />
          )}
        </div>

        {/* Waveform / info */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="bg-black/40 rounded-md border border-white/10 h-16 mb-3 flex items-center px-3">
            <div className="flex-1 h-[2px] bg-gradient-to-r from-white/40 via-white/10 to-transparent relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-white/70"
                style={{
                  width: state.track
                    ? `${(state.currentTime / state.track.duration) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <div className="ml-3 text-xs font-mono text-white/80">
              {formatTime(state.currentTime)}{' '}
              {state.track && `/ ${formatTime(state.track.duration)}`}
            </div>
          </div>

          {/* Pitch & Volume */}
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Pitch
              </span>
              <Fader
                value={state.pitch}
                min={-50}
                max={50}
                onChange={(v) => setPitch(id, v)}
              />
              <button
                className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-white"
                onClick={() => setPitch(id, 0)}
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Volume
              </span>
              <Fader
                value={state.volume}
                min={0}
                max={100}
                onChange={(v) => setVolume(id, v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transport controls */}
      <div className="mt-6 flex items-center justify-between">
        <button
          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
          onClick={() => togglePlay(id)}
          disabled={!state.track}
        >
          {state.playing ? (
            <Pause className="w-8 h-8 text-black" />
          ) : (
            <Play className="w-8 h-8 text-black" />
          )}
        </button>

        <button
          className="px-4 py-2 rounded-full bg-zinc-800 border border-white/10 text-xs font-bold text-white/80 hover:bg-zinc-700 active:scale-95 transition-all shadow-lg"
          onClick={() => setPitch(id, 0)}
        >
          SYNC
        </button>
      </div>
    </div>
  );
};
