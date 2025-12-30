import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, Fade } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../system/redux/slices/getme';
import { useUser } from '../components/UserProvider';

// Core components
import Sitebar from '../sitebar';
import WidgetMain from '../widget/widget';
import Panel from '../widget/panel';
import axios from "./axios.js";
import { lazyRetry } from '../utils/lazyRetry';

const Gemini = React.lazy(() => lazyRetry(() => import('../page/gemini/index.jsx')));
const Main = React.lazy(() => lazyRetry(() => import('../page/main/main')));
const Store = React.lazy(() => lazyRetry(() => import('../page/apps/store.jsx')));
const AtomsClicker = React.lazy(() => lazyRetry(() => import('../page/apps/game.jsx')));
const MobileSettings = React.lazy(() => lazyRetry(() => import('../widget/setting.jsx')));
const Music = React.lazy(() => lazyRetry(() => import('../page/music/music.jsx')));
const Reting = React.lazy(() => lazyRetry(() => import('../page/reting/index.jsx')));
const ChannelsList = React.lazy(() => lazyRetry(() => import("../page/channel/ChannelsList")));
const ChannelPage = React.lazy(() => lazyRetry(() => import("../page/channel/ChannelPage")));
const Wallet = React.lazy(() => lazyRetry(() => import('../page/wallet')));
const Profile = React.lazy(() => lazyRetry(() => import('../page/profile/Profile')));
const ChannelCreatePage = React.lazy(() => lazyRetry(() => import("../page/channel/CreateChannelPage")));
const Channel = React.lazy(() => lazyRetry(() => import('../page/channel/channel.jsx')));
const LoginPage = React.lazy(() => lazyRetry(() => import('../page/login')));
const RegistrationPage = React.lazy(() => lazyRetry(() => import('../page/registration')));
const CommentsStreamPage = React.lazy(() => lazyRetry(() => import('../page/comments-stream')));
const FullPost = React.lazy(() => lazyRetry(() => import('../page/main/post/FullPost.jsx')));
const SearchPage = React.lazy(() => lazyRetry(() => import('../page/search/SearchPage.jsx')));
const SettingsPage = React.lazy(() => lazyRetry(() => import('../page/settings/SettingsPage.jsx')));
const ThemeSelector = React.lazy(() => lazyRetry(() => import('../page/settings/ThemeSelector.jsx')));
const SubscriptionPage = React.lazy(() => lazyRetry(() => import('../page/subscription/SubscriptionPage.jsx')));

const GamePage = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const res = await axios.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, []);
  return <></>;
};

const LoadingFallback = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Fade in={visible} timeout={800}>
      <Box sx={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          alignItems: "center", backgroundColor: "#000", color: "#fff", zIndex: 9999, p: 4,
      }}>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src="/1.png" alt="Logo" style={{ width: "120px", height: "120px", objectFit: "contain" }} />
        </Box>
        <Box sx={{ textAlign: "center", fontSize: "25px", fontWeight: 700, opacity: 0.7, pb: 2 }}>
          AtomGlide
        </Box>
      </Box>
    </Fade>
  );
};
const AppRouter = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const location = useLocation();
  const { isLoading } = useUser();

  const isAuthPage = ['/login', '/registration'].includes(location.pathname);

  if (isLoading) return <LoadingFallback />;

  if (isAuthPage) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <Sitebar />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "280px minmax(0, 1fr) 320px",
          gap: isMobile ? "0px" : "24px",
          maxWidth: "1400px",
          margin: isMobile ? "0 auto" : "24px auto",
          padding: isMobile ? "0 8px" : "0 24px",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        {!isMobile && <Panel />}

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/setting" element={<MobileSettings />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/theme" element={<ThemeSelector />} />
            <Route path="/channel" element={<Channel />} />
            <Route path="/forbes" element={<Reting />} />
            <Route path="/create-channel" element={<ChannelCreatePage />} />
            <Route path="/store" element={<Store />} />
            <Route path="/channels" element={<ChannelsList />} />
            <Route path="/channel/:id" element={<ChannelPage />} />
            <Route path="/comments" element={<CommentsStreamPage />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/account/:id" element={<Profile />} />
            <Route path="/game" element={<GamePage />} />                              
            <Route path="/music" element={<Music/>} />                              
            <Route path="/post/:id" element={<FullPost />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/message" element={<AtomsClicker />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="*" element={<Main />} />
          </Routes>
        </Suspense>

        {!isMobile && <WidgetMain />}
      </Box>
    </>
  );
};

export default AppRouter;

// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00
