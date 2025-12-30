import React, { useState, useEffect, useMemo } from "react";
import axios from '../../system/axios';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  useMediaQuery,
  useTheme,
  Chip,
  IconButton,
  Avatar,
  Modal,
  Backdrop,
  Fade
} from "@mui/material";
import { 
  PlayArrow as PlayArrowIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import { useSelector } from 'react-redux';
import { selectUser } from '../../system/redux/slices/getme';
import { useNavigate } from 'react-router-dom';
import AudioPlayer from './play';

const COVER = "https://images.unsplash.com/photo-1549492167-27e1f4869c0d?w=800&auto=format&fit=crop&q=60";

const Music = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useSelector(selectUser);

  const [allTracks, setAllTracks] = useState([]);      
  const [recommendations, setRecommendations] = useState([]); 
  const [likedTrackIds, setLikedTrackIds] = useState(new Set()); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [activePlaylist, setActivePlaylist] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const promises = [axios.get("/tracks")];
        
        if (user) {
            promises.push(axios.get("/music/recommendations"));
            promises.push(axios.get("/music/liked"));
        }

        const results = await Promise.allSettled(promises);

        if (results[0].status === 'fulfilled') {
          setAllTracks(results[0].value.data.map(processTrackData));
        }

        if (user && results[1]?.status === 'fulfilled') {
          setRecommendations(results[1].value.data.tracks.map(processTrackData));
        }

        if (user && results[2]?.status === 'fulfilled') {
          const ids = results[2].value.data.map(t => typeof t === 'object' ? t._id : t);
          setLikedTrackIds(new Set(ids));
        }
      } catch (err) {
        console.error("Ошибка загрузки музыки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const processTrackData = (track) => ({
    ...track,
    cover: track.cover || COVER,
    authorName: track.authorName || "Неизвестный исполнитель",
    title: track.title || "Без названия",
  });

  const handlePlay = (track, index, sourceList) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (activePlaylist !== sourceList) setActivePlaylist(sourceList);
    setCurrentIndex(index);
  };

  const toggleLike = async (e, trackId) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setLikedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });

    try {
      await axios.post(`/music/like/${trackId.toString().split(':')[0]}`);
    } catch (err) {
      console.error("Ошибка лайка");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const promoTrack = allTracks[0];

  return (
    <Box sx={{
        px: 2, py: 2, pb: currentIndex !== null ? 14 : 4, height: "100vh",
        overflowY: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { width: 0 }
    }}>
      
      {promoTrack && (
        <Box sx={{ 
          position: 'relative', width: '100%', height: 220, borderRadius: 6, mb: 4, 
          overflow: 'hidden', display: 'flex', alignItems: 'center', p: 3,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          cursor: 'pointer'
        }} onClick={() => handlePlay(promoTrack, 0, [promoTrack])}>
          <Box sx={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${promoTrack.cover})`, backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(10px) brightness(0.4)', transform: 'scale(1.1)', zIndex: 1
          }} />
        <Box 
  sx={{ 
    position: 'relative', 
    zIndex: 2, 
    display: 'flex', 
    gap: 3, 
    alignItems: 'center', 
    flexWrap: { xs: 'wrap', md: 'nowrap' } 
  }}
>
  <Avatar 
    src={promoTrack.cover} 
    variant="rounded" 
    sx={{ 
      width: { xs: 100, md: 140 }, 
      height: { xs: 100, md: 140 }, 
      borderRadius: 3, 
      boxShadow: 10 
    }} 
  />
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Chip 
      label="Новая музыка" 
      size="small" 
      sx={{ 
        bgcolor: 'rgba(237, 92, 25, 1)', 
        color: '#fff', 
        fontFamily:'arial',
        fontWeight: '600', 
        pt:0.3,
        mb: 1.5, 
        fontSize: { xs: '10px', md: '15px' } 
      }} 
    />
  <Typography
  fontWeight="900"
  sx={{
    color: '#fff',
    mb: 0.5,
fontSize: { 
  xs: 'clamp(0.6rem, 3vw, 1rem)', 
  md: 'clamp(1.2rem, 2.5vw, 1.6rem)' 
},
    lineHeight: 1.2,
  }}
>
  {promoTrack.title}
</Typography>

<Typography
  sx={{
    color: 'rgba(255,255,255,0.7)',
    mb: 2.5,
fontSize: { 
  xs: 'clamp(0.5rem, 2.5vw, 0.8rem)', 
  md: 'clamp(0.9rem, 1.8vw, 1.1rem)' 
},
    lineHeight: 1.2,
  }}
>
  {promoTrack.authorName}
</Typography>

    <Button 
      variant="contained" 
      startIcon={<PlayArrowIcon />}
      sx={{ 
        bgcolor: 'rgba(237, 92, 25, 1)', 
        color: '#ffffffff', 
        borderRadius: 50, 
                fontFamily:'arial',

        fontWeight: 'bold', 
        px: { xs: 2, md: 4 }, 
        '&:hover': { bgcolor: '#e0e0e0' } 
      }}
    >
      Слушать
    </Button>
  </Box>
</Box>

        </Box>
      )}

      {user && recommendations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" mb={2} sx={{ fontFamily: 'sf' }}>Персонально для вас</Typography>
          <Box>
              {recommendations.map((track, idx) => (
                <TrackItem 
                  key={`rec-${track._id}`} track={track} isAuth={true}
                  isLiked={likedTrackIds.has(track._id)}
                  onPlay={() => handlePlay(track, idx, recommendations)}
                  onLike={(e) => toggleLike(e, track._id)}
                  isActive={activePlaylist === recommendations && currentIndex === idx}
                />
              ))}
          </Box>
        </Box>
      )}

      <Box sx={{ opacity: user ? 1 : 0.7 }}>
        <Typography variant="h5" fontWeight="bold" mb={2} sx={{ fontFamily: 'sf' }}>
            {user ? "Вся музыка" : "Популярные треки"}
        </Typography>
        {allTracks.map((track, idx) => (
          <TrackItem 
            key={`all-${track._id}`} track={track} isAuth={Boolean(user)}
            isLiked={likedTrackIds.has(track._id)}
            onPlay={() => handlePlay(track, idx, allTracks)}
            onLike={(e) => toggleLike(e, track._id)}
            isActive={activePlaylist === allTracks && currentIndex === idx}
          />
        ))}
        <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}> Музыкальный сервис AtomGlide Music является открытой платформой для публикации аудиоконтента. Каждый пользователь имеет право загружать собственные композиции, принимая на себя полную юридическую и персональную ответственность за содержание и соблюдение авторских прав. Сервис предназначен для размещения авторских песен, а также ремиксов, распространяемых по свободным лицензиям (Creative Commons и аналоги). </Typography>

<Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}> Стриминг и использование композиций, защищенных авторским правом, регулируется внутренними нормативами сети: atomglide.com/atomwiki.html. Публикация такого контента требует строгого соблюдения правил цитирования: обязательного указания авторов, правообладателей (лейблов) и использования оригинальных обложек. Если вы являетесь правообладателем и обнаружили контент, нарушающий ваши права, пожалуйста, свяжитесь с поддержкой в Telegram: @jpegweb для оперативного удаления. </Typography>

<Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}> Сервис не предоставляет платный доступ к прослушиванию музыки. Подписка AtomPro+ не является платой за контент, а предоставляет техническую возможность загрузки аудиофайлов объемом более 10 МБ. Модерация платформы работает в круглосуточном режиме для обеспечения соблюдения правил сообщества. </Typography>

<Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}> Данный музыкальный раздел создан исключительно в развлекательных целях и не имеет целью извлечение коммерческой прибыли разработчиками сайта. Все права на торговые марки и логотипы принадлежат их законным владельцам. </Typography>

<Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 30 }}> © 2026 DK Studio. Все права защищены. </Typography>
      </Box>

      {user && (
        <AudioPlayer
            tracks={activePlaylist.length > 0 ? activePlaylist : allTracks}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            baseApiUrl={axios.defaults.baseURL}
        />
      )}

      <Modal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={isAuthModalOpen}>
          <Box sx={modalStyle}>
            <Box sx={{ 
                width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(237, 93, 25, 0.15)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 
            }}>
                <PlayArrowIcon sx={{ fontSize: 35, color: 'rgb(237, 93, 25)' }} />
            </Box>
            
            <Typography variant="h5" fontWeight="800" mb={1.5} sx={{ fontFamily: 'sf' }}>
                Музыка AtomGlide
            </Typography>
            
            <Typography sx={{ opacity: 0.8, mb: 4, fontSize: '15px', lineHeight: 1.5, fontFamily: 'sf' }}>
                Чтобы слушать музыку создайте аккаунт или просто если есть войдите в него. 
                Это даст вам доступ ко всей библиотеке музыке без рекламы и бесплатной в высоком качестве.
            </Typography>

            <Button 
              fullWidth variant="contained" 
              onClick={() => navigate('/login')}
              sx={{ 
                bgcolor: 'rgb(237, 93, 25)', mb: 2, borderRadius: '14px', py: 1.5, 
                fontWeight: 'bold', fontSize: '16px', '&:hover': { bgcolor: 'rgb(210, 80, 20)' }
              }}
            >
              Войти в аккаунт
            </Button>
            
            <Button 
                fullWidth 
                onClick={() => setIsAuthModalOpen(false)} 
                sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 500 }}
            >
                Позже
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

const TrackItem = ({ track, isLiked, onPlay, onLike, isActive, isAuth }) => {
  return (
    <Box 
      onClick={onPlay} 
      sx={{ 
        display:'flex', alignItems:'center', gap:2, p:1.2, borderRadius:3, cursor:'pointer', 
        transition: '0.2s',
        bgcolor: isActive ? 'rgba(237, 93, 25, 0.12)' : 'transparent',
        '&:hover':{ bgcolor: isActive ? 'rgba(237, 93, 25, 0.18)' : 'rgba(255,255,255,0.06)' } 
      }}
    >
      <Box sx={{ position: 'relative', width: 55, height: 55, minWidth: 55 }}>
        <Box 
            component="img" 
            src={track.cover || "/1.png"} 
            onError={(e) => { e.target.src = "/1.png"; }}
            sx={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:2 }} 
        />
        {isActive && (
          <Box sx={{ position:'absolute', top:0, left:0, right:0, bottom:0, bgcolor:'rgba(0,0,0,0.5)', borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Box className="equalizer" sx={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '12px' }}>
                <Box sx={{ width: '3px', bgcolor: 'rgb(237, 93, 25)', animation: 'eq 0.6s infinite ease-in-out', height: '60%' }} />
                <Box sx={{ width: '3px', bgcolor: 'rgb(237, 93, 25)', animation: 'eq 0.8s infinite ease-in-out', height: '100%' }} />
                <Box sx={{ width: '3px', bgcolor: 'rgb(237, 93, 25)', animation: 'eq 0.5s infinite ease-in-out', height: '40%' }} />
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ minWidth:0, flexGrow:1 }}>
        <Typography fontWeight={isActive ? "bold" : "500"} sx={{ fontSize: '15px' }} noWrap>{track.title}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ opacity: 0.7 }}>{track.authorName}</Typography>
      </Box>

      {isAuth && (
        <IconButton onClick={onLike} size="small" sx={{ color: isLiked ? 'rgb(237, 93, 25)' : 'rgba(255,255,255,0.3)' }}>
          {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
      )}
      
      <PlayArrowIcon sx={{ fontSize: 20, color: isActive ? 'rgb(237, 93, 25)' : 'rgba(255,255,255,0.2)' }} />

      <style>{`
        @keyframes eq { 
          0%, 100% { height: 4px; } 
          50% { height: 12px; } 
        }
      `}</style>
    </Box>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 420 },
  bgcolor: '#0a0a0a',
  borderRadius: '32px',
  p: 4,
  textAlign: 'center',
  color: '#fff',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  backgroundImage: `url(/PICO1.png), url(/PICO2.png)`,
  backgroundRepeat: 'repeat, repeat',
  backgroundSize: '200px 200px, 200px 200px',
  backgroundPosition: '0 0, 100px 100px',
  border: '1px solid rgba(255,255,255,0.08)',
  overflow: 'hidden'
};

export default Music;