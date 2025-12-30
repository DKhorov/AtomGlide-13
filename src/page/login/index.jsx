import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import logo from './1.png';
import '../../fonts/stylesheet.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuth, selectIsAuth, selectAuthError, selectAuthStatus } from '../../system/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const authError = useSelector(selectAuthError);
  const authStatus = useSelector(selectAuthStatus);

  const [username, setUsername] = useState("");
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (isAuth) {
      navigate('/');
      window.location.reload();
    } else if (authError) {
      alert('Неверный логин или пароль');
    }
  }, [isAuth, authError, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(false);
    if (password.length < 6) {
      setPasswordError(true);
      return;
    }
    await dispatch(fetchAuth({ username, password }));
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed', 
      top: 0,
      left: 0,
      overflowY: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      
        backgroundImage: `url(/PICO1.png), url(/PICO2.png)`,
        backgroundRepeat: 'repeat, repeat',
        backgroundSize: '500px 500px, 500px 500px', 
        backgroundPosition: '0 0, 250px 250px', 
        filter: 'brightness(0.4)', 
      },
      backgroundColor: '#0e1116',
    }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '450px',
          p: { xs: 3, sm: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '30px',
          m: 2
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{ width: '105px', height: '105px', objectFit: 'contain', marginBottom: 13, marginTop: 15 }} />
          <Typography sx={{
            fontFamily: "'Yandex Sans', Arial, Helvetica, sans-serif",
            textAlign: 'center',
            fontSize: '28px',
            color: 'rgba(230, 237, 243, 0.9)',
            fontWeight: 700,
            letterSpacing: '0.5px',
            mb: 0,
          }}>
            AtomGlide 
          </Typography>
          <Typography sx={{
            fontFamily: "'Yandex Sans', Arial, Helvetica, sans-serif",
            textAlign: 'center',
            fontSize: '16px',
            color: "rgba(230, 237, 243, 0.6)",
            mb: 4
          }}>Сервис для общения, работы</Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="@Dmitry"
              value={isUsernameFocused ? (username.startsWith('@') ? username : '@' + username.replace(/@+/g, '')) : username}
              onFocus={e => {
                setIsUsernameFocused(true);
                if (!username) setUsername("@");
              }}
              onBlur={() => {
                setIsUsernameFocused(false);
                if (username === "@") setUsername("");
              }}
              onChange={e => {
                let val = e.target.value;
                if (!val.startsWith('@')) val = '@' + val.replace(/@+/g, '');
                setUsername(val);
              }}
              sx={inputStyles}
            />

            <TextField
              placeholder="Пароль"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={passwordError}
              helperText={passwordError ? 'Минимум 6 символов' : ''}
              sx={inputStyles}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={authStatus === 'loading'}
              sx={{
                borderRadius: '50px',
                py: 2,
                mt: 2,
                background: '#866023ff',
                fontSize: '18px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { background: '#c38115ff' },
              }}
            >
              {authStatus === 'loading' ? 'Загрузка...' : 'Войти'}
            </Button>

            <Typography
              sx={{
                color: 'rgba(230, 237, 243, 0.6)',
                textAlign: 'center',
                fontSize: '16px',
                mt: 2,
              }}
            >
              Нет аккаунта?{' '}
              <span
                style={{ color: '#58a6ff', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/registration')}
              >
                Создать аккаунт
              </span>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const inputStyles = {
  background: 'rgba(33, 38, 45, 0.8)',
  borderRadius: '50px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px',
    color: '#fff',
    fontSize: '18px',
    '& fieldset': { borderColor: 'rgba(48, 54, 61, 0.8)' },
    '&:hover fieldset': { borderColor: 'rgba(88, 166, 255, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#58a6ff' },
  },
  '& .MuiInputBase-input::placeholder': { color: 'rgba(230, 237, 243, 0.4)' },
};

export default LoginPage;