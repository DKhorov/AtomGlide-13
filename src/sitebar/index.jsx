import React, { useState, useMemo } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery,
  Box, TextField, Button, IconButton, Typography, Alert, Fade, Avatar
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import { TbMusicPlus } from "react-icons/tb";
import { FaWallet } from "react-icons/fa";

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import axios from "../system/axios";
import { selectUser } from '../system/redux/slices/getme';
import { ReactComponent as StoreIcon } from './14.svg';
import PostCreatorModal from '../page/main/PostCreator';

const ACCENT_COLOR = 'rgb(237, 93, 25)';
const BACKGROUND_COLOR = 'rgba(14, 17, 22, 1)';
const DIALOG_BG = '#121212';
const INPUT_BG = 'rgba(255, 255, 255, 0.03)';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';

const CustomTextField = ({ label, ...props }) => (
  <TextField
    {...props}
    fullWidth
    label={label}
    variant="standard"
    InputLabelProps={{ 
      shrink: true, 
      sx: { 
        color: ACCENT_COLOR, 
        fontWeight: 600, 
        fontSize: '14px',
        '&.Mui-focused': { color: ACCENT_COLOR }
      } 
    }}
    InputProps={{
      disableUnderline: true,
      sx: {
        color: '#fff',
        bgcolor: INPUT_BG,
        borderRadius: '14px',
        px: 2,
        py: 0.8,
        mt: '22px !important',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
        '&.Mui-focused': {
          border: `1px solid ${ACCENT_COLOR}`,
          bgcolor: 'rgba(0,0,0,0.3)',
          boxShadow: `0 0 0 4px rgba(237, 93, 25, 0.1)`
        }
      }
    }}
  />
);

const Sitebar = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const isSmallMobile = useMediaQuery('(max-width:500px)');
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openPostCreator, setOpenPostCreator] = useState(false);
  
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [trackData, setTrackData] = useState({ title: "", genre: "", cover: "" });
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSearch = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false); 
    }
  };

  const handleOpenUpload = () => setOpenUpload(true);
  const handleClose = () => {
    setOpenUpload(false);
    setTrackData({ title: "", genre: "", cover: "" });
    setSelectedFile(null);
    setUploading(false);
    setUploadError("");
  };

  const handleInputChange = (e) => {
    setTrackData({ ...trackData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > 10) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const res = await axios.get('/subscription/info');
            if (res.data && !res.data.subscription?.isActive) {
              setUploadError(`Файл слишком большой (${fileSizeMB.toFixed(2)}MB). Максимальный размер для обычных пользователей: 10MB. Для загрузки файлов больше 10MB требуется подписка AtomPro+`);
              return;
            }
          } else {
            setUploadError(`Файл слишком большой (${fileSizeMB.toFixed(2)}MB). Максимальный размер: 10MB. Для загрузки файлов больше 10MB требуется подписка AtomPro+`);
            return;
          }
        } catch (err) {
          setUploadError(`Файл слишком большой (${fileSizeMB.toFixed(2)}MB). Максимальный размер: 10MB. Для загрузки файлов больше 10MB требуется подписка AtomPro+`);
          return;
        }
      }
      
      setSelectedFile(file);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !trackData.title.trim() || !trackData.genre.trim()) {
      setUploadError("Заполните название, жанр и выберите файл!");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      const formData = new FormData();
      formData.append("track", selectedFile);
      formData.append("title", trackData.title);
      formData.append("genre", trackData.genre);
      formData.append("cover", trackData.cover);
    
      await axios.post("/PostTrack", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      handleClose();
      navigate("/music");
    } catch (err) {
      setUploadError(err.response?.data?.message || "Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

 const menuItems = useMemo(() => {
  const items = [
    { label: 'Главная', href: '/' },
    { label: 'Магазин', href: '/store' },
    { label: 'Каналы', href: '/channels' },
    { label: 'Музыка', href: '/music' },
    { label: 'Рейтинг', href: '/forbes' },
  ];

  if (user) {
    items.push(
      { label: 'Кошелёк', href: '/wallet' },
      { label: 'Профиль', href: `/account/${user.id || user._id}` },
      { label: 'Настройки', href: '/settings' },
      { label: 'AtomPro+', href: '/subscription' }
      
    );
  }
  if (!user) {
    items.push(
         { label: 'Войти в аккаунт', href: '/login' },

    );
  }

  return items;
}, [user]);

  const handleNavigation = (href, label) => {
    if (label === 'Профиль' && (!user || (!user.id && !user._id))) {
        alert('Пользователь не найден. Попробуйте обновить страницу.');
        return;
    }
    navigate(href);
    setIsOpen(false);
  };

  return (
    <Box sx={{ width: '100%', bgcolor: BACKGROUND_COLOR, position: 'sticky', top: 0, zIndex: 1100 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: isMobile ? '8px 15px' : '10px 24px',
        borderBottom: `1px solid ${BORDER_COLOR}`
      }}>
        
        <Box 
          onClick={() => navigate('/')} 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
        >
          <StoreIcon style={{ width: 30, height: 30 }} />
          {!isSmallMobile && <span style={{ fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '-0.5px' }}>Atom</span>}
        </Box>

        {!isMobile && (
          <Box sx={{ flexGrow: 1, maxWidth: '500px', mx: 4, position: 'relative' }}>
             <input 
              type="text" 
              placeholder="Поиск..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              style={{
                width: '100%',
                padding: '10px 18px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.05)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </Box>
        )}

    <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '12px' }}>
  
  {user ? (
    <>
      <IconButton 
        onClick={() => setOpenPostCreator(true)} 
        sx={{ color: '#fff', '&:hover': { color: ACCENT_COLOR } }}
      >
        <AddIcon />
        {!isMobile && <Typography sx={{ fontSize: '14px', ml: 1, fontWeight: 500 }}>Создать</Typography>}
      </IconButton>
      
      <IconButton onClick={handleOpenUpload} sx={{ color: '#fff', '&:hover': { color: ACCENT_COLOR } }}>
        <TbMusicPlus size={22} />
      </IconButton>
    </>
  ) : (
    <Button
      variant="contained"
      onClick={() => navigate('/login')} 
      sx={{
        bgcolor: ACCENT_COLOR,
        color: '#fff',
        borderRadius: '10px',
        textTransform: 'none',
        fontWeight: 600,
        px: isMobile ? 2 : 3,
        '&:hover': { bgcolor: '#d44d15' }
      }}
    >
      Войти
    </Button>
  )}
     {isMobile && (
            <IconButton onClick={toggleMenu}>
              {isOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}

</Box>
      </Box>

      {!isMobile && (
        <Box sx={{ 
          display: 'flex', gap: 2 ,px: 3, py: 1.5, 
          overflowX: 'auto', whiteSpace: 'nowrap',
          borderTop: `1px solid rgba(255,255,255,0.02)` 
        }}>
          {menuItems.map((item) => (
            <Typography
              key={item.label}
              onClick={() => handleNavigation(item.href, item.label)}
              sx={{ 
                color: '#888', 
                fontSize: '17px', 
                fontWeight: 500,
                cursor: 'pointer', 
                transition: '0.2s',
                '&:hover': { color: '#fff' } 
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Box>
      )}

      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
              backgroundColor: BACKGROUND_COLOR, zIndex: 2000, padding: '20px', display: 'flex', flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <IconButton onClick={toggleMenu} sx={{ color: '#fff' }}><CloseIcon fontSize="large" /></IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                <input 
                    type="text" placeholder="Поиск..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleSearch}
                    style={{
                        flexGrow: 1, padding: '15px', borderRadius: '12px', border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', outline: 'none'
                    }}
                />
                <IconButton onClick={handleSearch} sx={{ color: '#fff', bgcolor: ACCENT_COLOR, borderRadius: '12px', '&:hover': { bgcolor: '#d44d15' } }}>
                    <SearchIcon />
                </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {menuItems.map((item) => (
                <Typography
                  key={item.label}
                  onClick={() => handleNavigation(item.href, item.label)}
                  sx={{ 
                    color: '#fff', fontSize: '26px', fontWeight: 700, py: 2, 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                    letterSpacing: '-1px'
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog 
        open={openUpload} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          sx: {
            bgcolor: DIALOG_BG,
            backgroundImage: 'none',
            borderRadius: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            border: `1px solid ${BORDER_COLOR}`,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, p: 3, 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px', color: '#fff' }}>
            Загрузить трек
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: '#555', '&:hover': { color: '#fff' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, mt: 1 }}>
            {uploadError && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: '14px', fontSize: '14px' }}>
                {uploadError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3,mt:1 }}>
              <CustomTextField 
                label="Название трека" name="title" placeholder="I'm still standing"
                value={trackData.title} onChange={handleInputChange} 
              />
              <CustomTextField 
                label="Автор трека (группа)" name="genre" placeholder="Queen,Elton John, Imagine Dragons..."
                value={trackData.genre} onChange={handleInputChange} 
              />
              <CustomTextField 
                label="URL ОБЛОЖКИ (ОПЦИОНАЛЬНО)" name="cover" placeholder="https://..."
                value={trackData.cover} onChange={handleInputChange} 
              />
            </Box>

            <Button
              variant="outlined"
              component="label"
              sx={{
                mt: 1, py: 4,
                display: 'flex', flexDirection: 'column', gap: 1.5,
                borderRadius: '20px',
                border: `2px dashed ${selectedFile ? ACCENT_COLOR : 'rgba(255,255,255,0.1)'}`,
                bgcolor: selectedFile ? 'rgba(237, 93, 25, 0.04)' : INPUT_BG,
                color: selectedFile ? '#fff' : '#666',
                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'none',
                '&:hover': {
                  borderColor: ACCENT_COLOR,
                  bgcolor: 'rgba(237, 93, 25, 0.08)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {selectedFile ? (
                <>
                  <MusicNoteIcon sx={{ fontSize: 44, color: ACCENT_COLOR }} />
                  <Typography sx={{ fontWeight: 600, color: '#fff' }}>{selectedFile.name}</Typography>
                  <Typography variant="caption" sx={{ color: ACCENT_COLOR }}>Файл готов к загрузке</Typography>
                </>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 44, mb: 0.5, opacity: 0.5 }} />
                  <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>Выберите аудиофайл</Typography>
                  <Typography variant="caption">MP3 до 10мб</Typography>
                </>
              )}
              <input type="file" hidden accept="audio/*" onChange={handleFileChange} />
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'space-between' }}>
          <Button onClick={handleClose} sx={{ color: '#666', fontWeight: 600, '&:hover': { color: '#fff' } }}>
            Отмена
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={uploading || !selectedFile}
            sx={{ 
              bgcolor: ACCENT_COLOR, px: 6, py: 1.4, borderRadius: '50px',
              fontWeight: 700, fontSize: '15px', textTransform: 'none',
              boxShadow: `0 10px 25px rgba(237, 93, 25, 0.3)`,
              '&:hover': { bgcolor: '#d44d15', boxShadow: `0 12px 30px rgba(237, 93, 25, 0.5)` },
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: '#444' }
            }}
          >
            {uploading ? "Загрузка..." : "Опубликовать трек"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* МОДАЛКА СОЗДАНИЯ ПОСТА */}
      {openPostCreator && (
        <PostCreatorModal 
          open={openPostCreator}
          onClose={() => setOpenPostCreator(false)}
          onPostCreated={(newPost) => {
            setOpenPostCreator(false);
            if (newPost?._id) navigate(`/post/${newPost._id}`);
          }}
        />
      )}
    </Box>
  );
};

export default Sitebar;