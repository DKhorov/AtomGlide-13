import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import axios from '../system/axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../system/redux/slices/getme';

const WidgetMain = React.memo(() => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [errorChannels, setErrorChannels] = useState('');

  const videoUrl = 'http://localhost:3000/videos/1765046418240-910908295.mp4';

if (!user) {
    return (
   <Box
      sx={{
        position: "sticky",
        top: "calc(115px)", 
        height: "calc(100vh - 60px - 48px)", 
        overflowY: "auto", 
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >

  

<div className="sidebar-promo2 with-image">
    <div className="image-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
        

        <img
            src="https://atomglidedev.ru/uploads/1765567079455-12036511.jpg"
            alt="Promo"
            style={{ width: "100%", height: "100%", borderRadius: "8px", display: "block", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))", color: "white", borderRadius: "0 0 8px 8px" }}>
            <h4 style={{ margin: 0 }}>Войти в аккаунт</h4>
            <p style={{ margin: 0 }}>Открой для себя больше возможностей просто войти в аккаунт</p>
        </div>
    </div>
</div>
     
    </Box>
    );
  }
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get('/channels');
        setChannels(res.data);
        setLoadingChannels(false);
      } catch (err) {
        setErrorChannels('Не удалось загрузить каналы');
        setLoadingChannels(false);
      }
    };
    fetchChannels();
  }, []);



  return (
    <Box
      sx={{
        position: "sticky",
        top: "calc(115px)",
        height: "calc(100vh - 60px - 48px)", 
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
         <Box
              sx={{
                width: '100%',
              
                backgroundColor: "rgba(22, 22, 22, 0.35)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--border-radius-main)",
          padding: "16px 20px",
                borderRadius: 4,
                p: 2,
                color: 'white',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} sx={{mt:-0.1}}>
                <Avatar
                  src={user.avatarUrl ? `https://atomglidedev.ru${user.avatarUrl}` : ''}
                  sx={{ width: 65, height: 65, border: '2px solid #333' }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 'bold',fontSize:'20px' ,mb:0,fontFamily:'sf',fontWeight:'bold'}}>{user.fullName || user.username}</Typography>
                  <Typography sx={{ color: 'gray', fontSize: 14 ,mt:-0.6}}>
                    {user.username}
                  </Typography>
                </Box>
              </Box>
      
          
      
      
          <Button
        fullWidth
        onClick={() => navigate(`/account/${user.id || user._id}`)}
        sx={{
          background: 'rgb(237,93,25)',
          color: 'white',
          pt: 0.5,
          pb: 0.7,
          fontFamily: "sf",
          fontWeight: 'bold',
          mt: 2,
          fontSize:'20px',
          textTransform: 'none', 
          borderRadius: 50,
          '&:hover': {
            background: 'rgb(237,93,25)',
          },
        }}
      >
        Открыть профиль
      </Button>
            </Box>

<div className="sidebar-promo2 with-image">
    <div className="image-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
        

        <img
            src="https://atomglidedev.ru/uploads/1765567079455-12036511.jpg"
            alt="Promo"
            style={{ width: "100%", height: "100%", borderRadius: "8px", display: "block", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))", color: "white", borderRadius: "0 0 8px 8px" }}>
            <h4 style={{ margin: 0 }}>Новости мира игр!</h4>
            <p style={{ margin: 0 }}>Акутальные новости игр и новинок в @game_news</p>
        </div>
    </div>
</div>
     
    </Box>
  );
});

export default WidgetMain;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/