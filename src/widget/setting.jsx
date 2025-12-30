import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { 
  Box, 
  Typography, 
  IconButton, 
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { ArrowLeft, Camera } from 'phosphor-react';
import axios from '../system/axios';

const MobileSettings = ({ onClose }) => {
  const [profile, setProfile] = useState({
    avatar: '',
    cover: '',
    fullName: '',
    username: '',
    about: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/auth/me');
        const user = res.data.user || res.data;
        setProfile({
          avatar: user.avatarUrl ? `https://atomglidedev.ru${user.avatarUrl}` : '',
          cover: user.coverUrl ? `https://atomglidedev.ru${user.coverUrl}` : '',
          fullName: user.fullName || '',
          username: user.username || '',
          about: user.about || ''
        });
      } catch (err) {
        setSnackbar({ open: true, message: 'Ошибка загрузки профиля', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleClick = () => {
    if (onClose) onClose();
    navigate("/");
  };

  const handleLogin = () => {
    if (onClose) onClose();
    navigate("/login");
  };

  const handleFileUpload = async (e, type = 'avatar') => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append(type, file);
      const res = await axios.patch('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (type === 'avatar') {
        setProfile(prev => ({ ...prev, avatar: res.data.user.avatarUrl }));
        setSnackbar({ open: true, message: 'Аватар обновлен', severity: 'success' });
      } else {
        setProfile(prev => ({ ...prev, cover: res.data.user.coverUrl }));
        setSnackbar({ open: true, message: 'Фон обновлен', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Ошибка загрузки изображения', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await axios.patch('/auth/me', {
        fullName: profile.fullName,
        about: profile.about
      });
      setSnackbar({ open: true, message: 'Профиль сохранен', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Ошибка сохранения', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const suggestedAvatars = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Shiba_inu_taiki.jpg/250px-Shiba_inu_taiki.jpg",
    "https://dogtime.com/wp-content/uploads/sites/12/2011/01/GettyImages-653001154-e1691965000531.jpg?w=1024",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9ii4b7kjlD8zUQaUV18VOVTAPCwcwEgMLqA&s",
    "https://bogatyr.club/uploads/posts/2024-03/73614/thumbs/1711746394_bogatyr-club-jdey-p-pikselnie-avatarki-1.png",
    "https://i.pinimg.com/736x/a9/60/81/a9608101c3580e04283d4b16f8fd510b.jpg",
    "https://cs13.pikabu.ru/post_img/2021/01/29/9/1611931777150914822.png",
    "https://bogatyr.club/uploads/posts/2024-03/73614/thumbs/1711746428_bogatyr-club-jh45-p-pikselnie-avatarki-7.png"
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 1)',
        zIndex: 1300,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={handleClick}
            sx={{
              color: 'white',
              mr: 1,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ArrowLeft size={24} />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Редактор профиля
          </Typography>
        </Box>

        {loading && !profile.avatar ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Cover */}
            <Typography sx={{ mb: 1, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Фоновое изображение
            </Typography>
            <Box sx={{ position: 'relative', mb: 5 }}>
              <input
                accept="image/*"
                id="cover-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'cover')}
              />
              <label htmlFor="cover-upload" style={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 150,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(34, 40, 47, 0.7)',
                    backgroundImage: profile.cover ? `url(${profile.cover})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  {!profile.cover && <Camera size={32} color="white" />}
                </Box>
              </label>

              {/* Avatar */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, 'avatar')}
                />
                <label htmlFor="avatar-upload">
                  <Avatar
                    src={profile.avatar}
                    sx={{
                      width: 90,
                      height: 90,
                      cursor: 'pointer',
                      border: '3px solid #1e1e2f',
                      backgroundColor: 'rgba(34, 40, 47, 0.7)',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  >
                    {!profile.avatar && <Camera size={28} />}
                  </Avatar>
                </label>
              </Box>
            </Box>

            <Box sx={{ mt: 6, display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
             <TextField
  label="Имя"
  value={profile.fullName}
  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
  fullWidth
  variant="outlined"
  sx={{ mb: 3 }}
  InputProps={{
    sx: {
      borderRadius: '100px',
      color: 'white',
      '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: '100px',
      },
    },
  }}
  InputLabelProps={{
    sx: { color: 'rgba(255,255,255,0.7)' },
  }}
/>

              <TextField
  label="О себе"
  value={profile.about}
  onChange={(e) => setProfile({ ...profile, about: e.target.value })}
  multiline
  rows={3}
  fullWidth
  variant="outlined"
  sx={{ mb: 3 }}
  InputProps={{
    sx: {
      color: 'white',
      borderRadius: '50px',
      pl:2,
      '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: '20px',
      },
    },
  }}
  InputLabelProps={{
    sx: { color: 'rgba(255,255,255,0.7)' },
  }}
/>

                <Button
                  onClick={handleSaveProfile}
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
               background:'#866023ff',
                    fontWeight: 'bold',
                    '&:hover': {
                      background:'#be8221ff',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
                <Typography sx={{ textAlign: 'center', color: 'gray', mt: 3 }} onClick={handleLogin}>
                  Войти в другой акк
                </Typography>
              </Box>

       
            </Box>
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileSettings;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
