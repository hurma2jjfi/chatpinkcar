import React, { useState, useRef, useEffect } from 'react';
import '../styles/Video.css';

const VideoPlayer = ({ src, poster }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setDuration(videoRef.current.duration);
      });
    }
  }, [videoRef]);

  const handlePlayPause = () => {
    setPlaying(!playing);
    if (!playing) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRewind = () => {
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleForward = () => {
    const newTime = Math.min(duration, videoRef.current.currentTime + 10);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`video-player ${isFullScreen ? 'full-screen' : ''}`}>
      <div className="video__wrapper">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="video"
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
      <div className="controls">
        <div className="icon__pauses">
          <button className="rewind" onClick={handleRewind}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M11 18l-6-6 6-6 1.41 1.41L8.83 12l4.58 4.59z" />
            </svg>
          </button>
          <button className="play-pause" onClick={handlePlayPause}>
            {playing ? (
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button className="forward" onClick={handleForward}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M13 18l6-6-6-6-1.41 1.41L15.17 12l-4.58 4.59z" />
            </svg>
          </button>
          <button className="full-screen-button" onClick={handleFullScreen}>
  {isFullScreen ? (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
    </svg>
  )}
</button>
        </div>
        <div className="progress-bar-video">
          <input
            className='play__line'
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
          />
          <div className="time__container">
          <span className="time">
            {new Date(currentTime * 1000).toISOString().slice(11, 19)} /{' '}
            {new Date(duration * 1000).toISOString().slice(11, 19)}
          </span></div>
        </div>
        <div className="volume-control">
          <div className="volume__center">
          <input
          className='volume__line'
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
          /></div>
<div className="volume__flex">
          <span>
  <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
  </svg>
  {Math.round(volume * 100)}%
</span></div>
      

        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
