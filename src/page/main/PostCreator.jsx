import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  Button,
  Modal,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Fade,
  Avatar,
  Divider,
  CircularProgress,
} from "@mui/material";
import { 
  FiImage, FiSmile, FiX, FiVideo, FiHash, 
  FiCheckCircle, FiAlertCircle, FiChevronDown 
} from "react-icons/fi";
import { IoMdSend } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../system/axios";

const ACCENT_COLOR = 'rgb(237, 93, 25)';
const BG_DARK = '#0a0a0a';
const BG_PANEL = 'rgba(20, 20, 20, 0.7)';
const BORDER_STYLE = '1px solid rgba(255, 255, 255, 0.08)';

const PostCreatorModal = ({ open: externalOpen, onClose: externalOnClose, onPostCreated }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOpen !== undefined ? externalOnClose : setInternalOpen;
  
  const [inputText, setInputText] = useState("");
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [videoDuration, setVideoDuration] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [uploadTab, setUploadTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/channels/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) {
          setChannels(res.data);
          if (res.data.length > 0) setSelectedChannel(res.data[0]._id);
        }
      } catch (err) { console.error("Ошибка загрузки каналов:", err); }
    };
    if (open) fetchChannels();
  }, [open]);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      setSelectedMedia(file);
      setMediaType(isVideo ? 'video' : 'image');
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(URL.createObjectURL(file));
      
      if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => { setVideoDuration(video.duration); URL.revokeObjectURL(video.src); };
        video.src = URL.createObjectURL(file);
      }
    }
  };

  const handleClose = () => {
    if (externalOnClose) externalOnClose(); else setInternalOpen(false);
    setInputText("");
    setSelectedMedia(null);
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaPreviewUrl(null);
    setShowMediaUpload(false);
    setError("");
  };

  const handleSendPost = async () => {
    if (!selectedChannel) return setError("Выберите канал");
    if (mediaType === 'video' && videoDuration > 30) return setError("Видео слишком длинное");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", inputText.trim());
      formData.append("channelId", selectedChannel);
      if (selectedMedia) {
        formData.append("media", selectedMedia);
        if (mediaType === 'video') formData.append("videoDuration", Math.floor(videoDuration));
      }
      const res = await axios.post("/posts", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onPostCreated) onPostCreated(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка создания");
    } finally { setLoading(false); }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: isMobile ? 0 : 2 }}
    >
      <Fade in={open}>
        <Box sx={{
          width: isMobile ? "100%" : "640px",
          height: isMobile ? "100%" : "auto",
          maxHeight: isMobile ? "100%" : "90vh",
          bgcolor: BG_DARK,
          borderRadius: isMobile ? 0 : "32px",
          border: BORDER_STYLE,
          boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative"
        }}>
          
          <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: ACCENT_COLOR, p: 1, borderRadius: '12px', display: 'flex' }}>
                    <FiHash color="white" size={18} />
                </Box>
                <Typography variant="h6" sx={{ color: "white", fontWeight: 700, letterSpacing: '-0.5px' }}>
                    Новая публикация
                </Typography>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: "rgba(255,255,255,0.3)", '&:hover': { color: '#fff' } }}>
              <FiX size={22} />
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Расскажите что-нибудь..."
              style={{
                width: '100%',
                minHeight: '120px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'white',
                fontSize: '18px',
                fontFamily: 'inherit',
                resize: 'none',
                lineHeight: 1.5
              }}
            />

            <AnimatePresence mode="wait">
              {mediaPreviewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ position: 'relative', marginTop: '20px', borderRadius: '20px', overflow: 'hidden' }}
                >
                  <IconButton
                    onClick={() => { setSelectedMedia(null); setMediaPreviewUrl(null); }}
                    sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', zIndex: 5, '&:hover': { bgcolor: '#f44336' } }}
                  >
                    <FiX size={16} />
                  </IconButton>
                  {mediaType === 'video' ? (
                    <Box>
                      <video src={mediaPreviewUrl} style={{ width: '100%', borderRadius: '20px', display: 'block' }} controls />
                      <Box sx={{ position: 'absolute', bottom: 15, left: 15, bgcolor: 'rgba(0,0,0,0.7)', px: 1.5, py: 0.5, borderRadius: '10px', backdropFilter: 'blur(5px)' }}>
                        <Typography sx={{ color: videoDuration > 30 ? '#ff5252' : '#4caf50', fontSize: '12px', fontWeight: 600 }}>
                          {Math.floor(videoDuration)}с / 30с
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <img src={mediaPreviewUrl} alt="preview" style={{ width: '100%', borderRadius: '20px', maxHeight: '400px', objectFit: 'cover' }} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          <Box sx={{ p: 3, bgcolor: BG_PANEL, backdropFilter: 'blur(10px)', borderTop: BORDER_STYLE }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <input ref={fileInputRef} type="file" hidden accept="image/*,video/*" onChange={handleMediaChange} />
                    <TooltipIconButton icon={<FiImage />} label="Фото" onClick={() => fileInputRef.current?.click()} color="#4caf50" />
                    <TooltipIconButton icon={<FiVideo />} label="Видео" onClick={() => fileInputRef.current?.click()} color="#2196f3" />
                    <TooltipIconButton icon={<FiSmile />} label="Эмодзи" color="#ffc107" />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.05)', px: 2, py: 0.8, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography sx={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>КАНАЛ:</Typography>
                    <Select
                        value={selectedChannel}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                        variant="standard"
                        disableUnderline
                        IconComponent={FiChevronDown}
                        sx={{ color: 'white', fontSize: '13px', fontWeight: 600, minWidth: '80px' }}
                    >
                        {channels.map(ch => (
                            <MenuItem key={ch._id} value={ch._id} sx={{ fontSize: '14px' }}>
                                {ch.nick || ch.name}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {error && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ff5252', mb: 2, bgcolor: 'rgba(255,82,82,0.1)', p: 1, borderRadius: '10px' }}>
                <FiAlertCircle />
                <Typography sx={{ fontSize: '13px' }}>{error}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '11px', color: '#555', maxWidth: '60%' }}>
                    Публикуя контент, вы подтверждаете соблюдение <span style={{ color: '#888' }}>стандартов AtomGlide</span>
                </Typography>
                
                <Button
                    onClick={handleSendPost}
                    disabled={loading || !inputText.trim() || channels.length === 0}
                    variant="contained"
                    endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IoMdSend />}
                    sx={{
                        bgcolor: ACCENT_COLOR,
                        borderRadius: '16px',
                        px: 4, py: 1.2,
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: `0 8px 20px rgba(237, 93, 25, 0.3)`,
                        '&:hover': { bgcolor: '#d44d15', boxShadow: `0 10px 25px rgba(237, 93, 25, 0.4)` },
                        '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: '#444' }
                    }}
                >
                    {loading ? "Публикация" : "Опубликовать"}
                </Button>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

const TooltipIconButton = ({ icon, label, onClick, color }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <IconButton 
            onClick={onClick}
            sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: color }
            }}
        >
            {React.cloneElement(icon, { size: 20 })}
        </IconButton>
        <Typography sx={{ fontSize: '10px', color: '#555', fontWeight: 700 }}>{label.toUpperCase()}</Typography>
    </Box>
);

export default PostCreatorModal;