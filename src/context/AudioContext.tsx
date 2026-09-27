import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { CurrentlyPlayingTrack } from '../types';

interface AudioContextType {
  currentTrack: CurrentlyPlayingTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playTrack: (track: CurrentlyPlayingTrack) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<CurrentlyPlayingTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const onError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const playTrack = (track: CurrentlyPlayingTrack) => {
    if (!audioRef.current) return;
    if (currentTrack?.audio_url === track.audio_url && currentTrack?.track_title === track.track_title) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
      return;
    }

    setCurrentTrack(track);
    setProgress(0);
    audioRef.current.src = track.audio_url;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Playback error / Autoplay prevented:', err);
        setIsPlaying(false);
      });
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const seek = (timeInSeconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
      setProgress(timeInSeconds);
    }
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        playTrack,
        pauseTrack,
        togglePlay,
        seek,
        closePlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
