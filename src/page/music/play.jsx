import React, { useRef, useEffect, useState } from "react";
import {
  Box, Typography, IconButton, Slider, Stack, useTheme, useMediaQuery, Slide, Switch
} from "@mui/material";
import {
  SkipNext as NextIcon, SkipPrevious as PreviousIcon, Close as CloseIcon, Settings as SettingsIcon, VolumeUp as VolumeIcon,
} from "@mui/icons-material";
import { FaPlay, FaPause } from "react-icons/fa";

const formatTime = (timeInSeconds) => {
  if (!timeInSeconds || Number.isNaN(timeInSeconds)) return "00:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};



const FullPlayer = ({
  open, handleClose, track, isPlaying, togglePlayPause, currentTime, duration,
  handleSeekCommitted, isMobile, goNext, goPrev, playbackRate, setPlaybackRate,
  filters, volume, setVolume, isSpatial, setIsSpatial, bassBoost, setBassBoost
}) => {
  const [showSettings, setShowSettings] = useState(false);

  if (!open || !track) return null;

  const handleFilterChange = (index, value) => {
    if (filters[index]) filters[index].gain.value = value;
  };

  return (
    <Box sx={{ 
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
      zIndex: 9999, backgroundColor: "black", color: "white", 
      display: "flex", flexDirection: "column", overflow: "hidden" 
    }}>
      <Box sx={{ 
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
        backgroundImage: `url(${track.cover})`, backgroundSize: "cover", 
        backgroundPosition: "center", filter: "blur(60px) brightness(0.3)", 
        transform: "scale(1.2)", zIndex: 0 
      }} />

      <Box sx={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton onClick={handleClose} sx={{ color: "white" }}><CloseIcon fontSize="large" /></IconButton>
          <IconButton onClick={() => setShowSettings(true)} sx={{ color: "white" }}><SettingsIcon fontSize="large" /></IconButton>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: "500px", mx: "auto", width: "100%", marginTop:'-60px' }}>
          <Box component="img" src={track.cover || "/1.png"} sx={{ width: "70%", aspectRatio: "1/1", borderRadius: 4, mb: 4, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", objectFit: "cover" }} />
          <Box sx={{ width: "100%", textAlign: "left", px: 2 }}>
            <Typography variant="h5" fontWeight="800" noWrap>{track.title}</Typography>
            <Typography variant="h6" sx={{ opacity: 0.6 }}>{track.genre}</Typography>
          </Box>
          <Box sx={{ width: "100%", mt: 4, px: 2 }}>
            <Slider value={currentTime} min={0} max={duration || 1} onChangeCommitted={handleSeekCommitted} sx={{ color: "white" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: -1 }}>
              <Typography variant="caption">{formatTime(currentTime)}</Typography>
              <Typography variant="caption">{formatTime(duration)}</Typography>
            </Box>
            <Stack direction="row" spacing={4} justifyContent="center" alignItems="center" mt={4}>
              <IconButton onClick={goPrev} sx={{ color: "white" }}><PreviousIcon sx={{ fontSize: 50 }} /></IconButton>
              <IconButton onClick={togglePlayPause} sx={{ color: "white" }}>
                {isPlaying ? <FaPause size={40} /> : <FaPlay size={40} />}
              </IconButton>
              <IconButton onClick={goNext} sx={{ color: "white" }}><NextIcon sx={{ fontSize: 50 }} /></IconButton>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Slide direction="left" in={showSettings} mountOnEnter unmountOnExit>
        <Box sx={{ 
          position: "absolute", top: 0, right: 0, width: isMobile ? "100%" : "340px", 
          height: "100%", bgcolor: "rgba(10,10,10,0.98)", zIndex: 10000, 
          p: 4, backdropFilter: "blur(20px)", borderLeft: "1px solid #333", overflowY: 'auto'
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h6" fontWeight="bold">Настройки аудио</Typography>
            <IconButton onClick={() => setShowSettings(false)} sx={{ color: "white" }}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ mb: 2, p: 2, borderRadius: 2, border: "1px solid #444", bgcolor: isSpatial ? "rgba(237, 93, 25, 0.15)" : "transparent" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">3D Объем (Spatial)</Typography>
              <Switch checked={isSpatial} onChange={(e) => setIsSpatial(e.target.checked)} color="warning" />
            </Stack>
          </Box>

          <Box sx={{ mb: 4, p: 2, borderRadius: 2, border: "1px solid #444", bgcolor: bassBoost > 0 ? "rgba(237, 93, 25, 0.15)" : "transparent" }}>
            <Typography variant="subtitle2" gutterBottom>Bass Boost: {bassBoost}dB</Typography>
            <Slider value={bassBoost} min={0} max={15} step={1} onChange={(e, v) => setBassBoost(v)} sx={{ color: "#ed5d19" }} />
          </Box>

          <Typography variant="subtitle2" color="gray" gutterBottom>Громкость: {Math.round(volume * 100)}%</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <VolumeIcon sx={{ color: "gray" }} />
            <Slider value={volume * 100} min={0} max={100} onChange={(e, v) => setVolume(v / 100)} sx={{ color: "white" }} />
          </Stack>

          <Typography variant="subtitle2" color="gray">Скорость воспроизведения</Typography>
          <Slider value={playbackRate} min={0.5} max={2.0} step={0.1} onChange={(e, v) => setPlaybackRate(v)} sx={{ mb: 4, color: "white" }} />

          <Typography variant="subtitle2" color="gray" gutterBottom>Эквалайзер</Typography>
          {['Низкие', 'Средние', 'Высокие'].map((label, i) => (
            <Box key={label} sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.7 }}>{label}</Typography>
              <Slider size="small" min={-12} max={12} step={1} defaultValue={0} onChange={(e, v) => handleFilterChange(i, v)} sx={{ color: "#ed5d19" }} />
            </Box>
          ))}
        </Box>
      </Slide>
    </Box>
  );
};



const AudioPlayer = ({ tracks = [], currentIndex, setCurrentIndex, baseApiUrl }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  const dryGainRef = useRef(null); 
  const wetGainRef = useRef(null); 
  const delayRef = useRef(null);  
  const bassBoostNodeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullOpen, setIsFullOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpatial, setIsSpatial] = useState(false);
  const [bassBoost, setBassBoost] = useState(0);
  const [filters, setFilters] = useState([]);

  const track = tracks[currentIndex] || null;

  useEffect(() => {
    if (!audioRef.current || audioCtxRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      
      const bBoost = ctx.createBiquadFilter();
      bBoost.type = "lowshelf";
      bBoost.frequency.value = 150;
      bBoost.gain.value = 0;
      bassBoostNodeRef.current = bBoost;

      const nodes = [100, 1000, 8000].map(f => {
        const filter = ctx.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = f;
        filter.gain.value = 0;
        return filter;
      });

      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const delay = ctx.createDelay();
      
      dryGainRef.current = dryGain;
      wetGainRef.current = wetGain;
      delayRef.current = delay;

      delay.delayTime.value = 0.025; 
      wetGain.gain.value = 0;

      source.connect(bBoost);
      bBoost.connect(nodes[0]);
      nodes[0].connect(nodes[1]);
      nodes[1].connect(nodes[2]);
      
      nodes[2].connect(dryGain);
      nodes[2].connect(delay);
      delay.connect(wetGain);
      
      dryGain.connect(ctx.destination);
      wetGain.connect(ctx.destination);

      setFilters(nodes);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!track || !audioRef.current) return;
    const audio = audioRef.current;
    
    audio.src = `${baseApiUrl}/stream/${track.trackname}`;
    audio.playbackRate = playbackRate;
    audio.volume = volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentIndex, track, baseApiUrl]);

  useEffect(() => {
    if (wetGainRef.current) {
      const now = audioCtxRef.current.currentTime;
      wetGainRef.current.gain.linearRampToValueAtTime(isSpatial ? 0.7 : 0, now + 0.3);
    }
  }, [isSpatial]);

  useEffect(() => {
    if (bassBoostNodeRef.current) {
      bassBoostNodeRef.current.gain.value = bassBoost;
    }
  }, [bassBoost]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.volume = volume;
    }
  }, [playbackRate, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const loaded = () => setDuration(audio.duration);
    const ended = () => (currentIndex < tracks.length - 1 ? setCurrentIndex(i => i + 1) : setIsPlaying(false));

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", loaded);
    audio.addEventListener("ended", ended);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", loaded);
      audio.removeEventListener("ended", ended);
    };
  }, [currentIndex, tracks.length]);

  const togglePlayPause = () => {
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
    } else {
        audioRef.current.play();
        setIsPlaying(true);
    }
  };

  const currentPercentage = duration ? (currentTime / duration) * 100 : 0;
  if (!track) return null;

  return (
    <>
      <Box sx={{ 
        position: "fixed", bottom: 0, left: 0, right: 0, mx: 2, mb: 2, 
        borderRadius: 3, bgcolor: "black", 
        backgroundImage: `linear-gradient(to right, rgba(237, 93, 25, 0.4) ${currentPercentage}%, black ${currentPercentage}%)`, 
        py: 1, px: 2, border: "1px solid #333", zIndex: 100, display: 'flex', alignItems: 'center', height: 65 
      }}>
        <Slider size="small" value={currentTime} min={0} max={duration || 1} onChangeCommitted={(e, v) => {audioRef.current.currentTime = v}} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, zIndex: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", width: '100%', position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1, pointerEvents: 'auto' }}>
            <Box component="img" src={track.cover || "/1.png"} onClick={() => setIsFullOpen(true)} sx={{ width: 45, height: 45, borderRadius: 1.5, cursor: 'pointer', objectFit: 'cover' }} />
          <Box sx={{ ml: 1.5, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
  <Typography 
    noWrap 
    sx={{ 
      fontWeight: '400', 
      fontSize: '0.9rem', 
      color: 'white',
      mb: 0.1, 
      lineHeight: 1.2 
    }} 
    onClick={() => setIsFullOpen(true)}
  >
    {track.title}
  </Typography>
  
  <Typography 
    variant="caption" 
    color="gray" 
    noWrap
    sx={{ 
      display: 'block',
      lineHeight: 1.2 
    }}
  >
    {track.genre}
  </Typography>
</Box>
          </Box>
          <Stack direction="row" spacing={1} sx={{ pointerEvents: 'auto' }}>
            <IconButton onClick={() => currentIndex > 0 ? setCurrentIndex(i => i - 1) : (audioRef.current.currentTime = 0)} sx={{ color: "white" }}><PreviousIcon /></IconButton>
            <IconButton onClick={togglePlayPause}>{isPlaying ? <FaPause size={14} color="#ed5d19" /> : <FaPlay size={14} color="white" />}</IconButton>
            <IconButton onClick={() => currentIndex < tracks.length - 1 && setCurrentIndex(i => i + 1)} sx={{ color: "white" }}><NextIcon /></IconButton>
          </Stack>
        </Box>
        <audio ref={audioRef} crossOrigin="anonymous" />
      </Box>

      <FullPlayer
        open={isFullOpen} handleClose={() => setIsFullOpen(false)}
        track={track} isPlaying={isPlaying} togglePlayPause={togglePlayPause}
        currentTime={currentTime} duration={duration}
        handleSeekCommitted={(e, v) => {audioRef.current.currentTime = v}}
        isMobile={isMobile}
        goNext={() => currentIndex < tracks.length - 1 && setCurrentIndex(i => i + 1)}
        goPrev={() => currentIndex > 0 && setCurrentIndex(i => i - 1)}
        playbackRate={playbackRate} setPlaybackRate={setPlaybackRate}
        filters={filters} volume={volume} setVolume={setVolume}
        isSpatial={isSpatial} setIsSpatial={setIsSpatial}
        bassBoost={bassBoost} setBassBoost={setBassBoost}
      />
    </>
  );
};

export default AudioPlayer;