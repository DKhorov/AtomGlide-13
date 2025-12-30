import PostCreator from './PostCreator';
import PostsList from './PostsList';
import axios from '../../system/axios';
import { useSelector } from 'react-redux';
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, useMediaQuery, Avatar ,Divider} from '@mui/material';
import { selectPanelCurve } from '../../system/redux/slices/store';
import { selectUser } from '../../system/redux/slices/getme';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton } from '@mui/material';

const POSTS_LIMIT = 20; 

const DateTimeNow = () => {
  const [now, setNow] = useState(new Date());
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = [
    'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
    'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
  ];

  const day = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  const avatarUrl = user?.avatarUrl ? `https://atomglidedev.ru${user.avatarUrl}` : '';
  const userName = user?.fullName || user?.name || user?.username || '';

  const handleAvatarClick = () => {
    if (user?.id || user?._id) {
      navigate(`/account/${user.id || user._id}`);
    }
  };

  return (
    <Box sx={{ 
      fontFamily: "'Yandex Sans'",
      marginRight:"20px",
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }}>
      <Typography sx={{
        fontSize: '12px',
        color: 'rgba(226, 226, 226, 0.8)',
        fontFamily: "'Yandex Sans'",
      }}>
        {hours}:{minutes}
      </Typography>
      <Avatar 
        src={avatarUrl} 
        onClick={handleAvatarClick}
        sx={{
          height: '30px',
          width: '30px',
          bgcolor: avatarUrl ? 'transparent' : 'rgba(226, 226, 226, 0.2)',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
      >
        {!avatarUrl && userName ? userName.charAt(0).toUpperCase() : 'U'}
      </Avatar>
    </Box>
  );
};

const Main = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const panelCurve = useSelector(selectPanelCurve);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0); 

  const hasMore = posts.length < totalPosts;

  const fetchPosts = useCallback(async (pageToLoad = 1) => { 
    try {
      setLoading(true);
      const response = await axios.get('/posts', {
        params: {
          page: pageToLoad, 
          limit: POSTS_LIMIT, 
        },
      });

      const { posts: newPosts, totalPosts: totalCount } = response.data;


      setPosts(prev => 
        pageToLoad === 1 ? newPosts || [] : [...prev, ...(newPosts || [])]
      );
      console.log("POSTS FROM SERVER:", newPosts);

      setTotalPosts(totalCount || 0);
      setPage(pageToLoad);

    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchPosts(1); 
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const handlePostCreated = (postData) => {
    setPosts(prev => [postData, ...prev]);
    setTotalPosts(prev => prev + 1); 
  };


  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
    setTotalPosts(prev => prev - 1); 
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  return (
    <Box
      sx={{
        minWidth: isMobile ? '0' : '200px',
        height: isMobile ? '100vh' : '100vh',
        flex: isMobile ? 1 : 'none',
        overflowY: 'auto',
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none', 
        '&::-webkit-scrollbar': {
          width: '0px', 
          background: 'transparent',
        },
        paddingBottom: isMobile ? '70px' : 0, 
        pl: 0, 
        pr: 0, 
        px:1,
      }}
    >
   

      <Box >
        <Box sx={{mb:1}}><PostCreator onPostCreated={handlePostCreated} /></Box> 
      <PostsList 
        posts={posts} 
        loading={loading} 
        onDelete={handleDeletePost}   
        onPostUpdate={handlePostUpdate}
        onLoadMore={handleLoadMore} 
        hasMore={hasMore}
      />
      </Box>
    </Box>
  );
};

export default Main;