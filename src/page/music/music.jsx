import React, { useState, useEffect } from "react";
import axios from "../../system/axios";
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
  Fade,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../system/redux/slices/getme";
import { useNavigate } from "react-router-dom";
import AudioPlayer from "./play";

const COVER =
  "https://images.unsplash.com/photo-1549492167-27e1f4869c0d?w=800&auto=format&fit=crop&q=60";

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

        if (results[0].status === "fulfilled") {
          setAllTracks(results[0].value.data.map(processTrackData));
        }

        if (user && results[1]?.status === "fulfilled") {
          setRecommendations(
            results[1].value.data.tracks.map(processTrackData)
          );
        }

        if (user && results[2]?.status === "fulfilled") {
          const ids = results[2].value.data.map((t) =>
            typeof t === "object" ? t._id : t
          );
          setLikedTrackIds(new Set(ids));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const processTrackData = (track) => ({
    ...track,
    cover: track.cover || COVER,
    title: track.title || "Без названия",
    genre: track.genre || "Без жанра",
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

    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });

    await axios.post(`/music/like/${trackId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const promoTrack = allTracks[0];
  const likedTracks = allTracks.filter((t) => likedTrackIds.has(t._id));

  return (
    <Box
      sx={{
        px: 2,
        py: 2,
        pb: currentIndex !== null ? 14 : 4,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* БАННЕР */}
      {promoTrack && (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 220,
            borderRadius: 6,
            mb: 4,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            p: 3,
            cursor: "pointer",
          }}
          onClick={() => handlePlay(promoTrack, 0, [promoTrack])}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${promoTrack.cover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(12px) brightness(0.4)",
              transform: "scale(1.1)",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 2, display: "flex", gap: 3 }}>
            <Avatar
              src={promoTrack.cover}
              variant="rounded"
              sx={{ width: 130, height: 130, borderRadius: 3 }}
            />
            <Box>
              <Chip
                label="Новая музыка"
                sx={{
                  bgcolor: "rgb(237,93,25)",
                  color: "#fff",
                  mb: 1.5,
                }}
              />
              <Typography fontWeight="900" sx={{ color: "#fff", mb: 0.5 }}>
                {promoTrack.title}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
                {promoTrack.genre}
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                sx={{ bgcolor: "rgb(237,93,25)", borderRadius: 50 }}
              >
                Слушать
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* МОИ ПОНРАВИВШИЕСЯ */}
      {user && likedTracks.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Мои понравившиеся треки
          </Typography>
          {likedTracks.map((track, idx) => (
            <TrackItem
              key={`liked-${track._id}`}
              track={track}
              isAuth
              isLiked
              onPlay={() => handlePlay(track, idx, likedTracks)}
              onLike={(e) => toggleLike(e, track._id)}
              isActive={
                activePlaylist === likedTracks && currentIndex === idx
              }
            />
          ))}
        </Box>
      )}

      {/* ВСЯ МУЗЫКА */}
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Вся музыка
      </Typography>

      {allTracks.map((track, idx) => (
        <TrackItem
          key={`all-${track._id}`}
          track={track}
          isAuth={Boolean(user)}
          isLiked={likedTrackIds.has(track._id)}
          onPlay={() => handlePlay(track, idx, allTracks)}
          onLike={(e) => toggleLike(e, track._id)}
          isActive={activePlaylist === allTracks && currentIndex === idx}
        />
      ))}

      {user && (
        <AudioPlayer
          tracks={activePlaylist.length ? activePlaylist : allTracks}
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
      >
        <Fade in={isAuthModalOpen}>
          <Box
            sx={{
              p: 4,
              bgcolor: "#0a0a0a",
              borderRadius: 4,
              color: "#fff",
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/login")}
            >
              Войти
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

const TrackItem = ({ track, isLiked, onPlay, onLike, isActive, isAuth }) => (
  <Box
    onClick={onPlay}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 1.2,
      marginTop:1,
      cursor: "pointer",
      bgcolor: isActive ? "rgba(237,93,25,0.12)" : "transparent",
    }}
  >
    <Avatar src={track.cover} variant="rounded" sx={{width:'50px',height:'50px'}} />
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography noWrap fontWeight={isActive ? "bold" : 500 }sx={{lineHeight:0.9}}>
        {track.title}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }} noWrap>
        {track.genre}
      </Typography>
    </Box>
    {isAuth && (
      <IconButton onClick={onLike}>
        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    )}
    <PlayArrowIcon
      sx={{ color: isActive ? "rgb(237,93,25)" : "rgba(255,255,255,0.3)" }}
    />
  </Box>
);

export default Music;
