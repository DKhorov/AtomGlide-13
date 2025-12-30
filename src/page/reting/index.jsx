import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, CircularProgress, Divider, Button, useMediaQuery, Chip, Card, CardContent } from '@mui/material';
import { Person, Article, TrendingUp, EmojiEvents } from '@mui/icons-material';
import axios from '../../system/axios';
import { useNavigate } from 'react-router-dom';

const Reting = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [popularUsers, setPopularUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const isMobile = useMediaQuery('(max-width:900px)');

  const loadRatingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [activeResponse, popularResponse] = await Promise.all([
        axios.get('/rating/active-users'),
        axios.get('/rating/popular-users')
      ]);
      
      setActiveUsers(activeResponse.data || []);
      setPopularUsers(popularResponse.data || []);

    } catch (e) {
      console.error('Ошибка загрузки рейтинга:', e);
      setError('Не удалось загрузить рейтинг');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatingData();
  }, []);

  const navigate = useNavigate();

  const renderTabs = () => (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
      <Button
  variant={activeTab === 'active' ? 'contained' : 'outlined'}
  size="small"
  startIcon={<Article />}
  onClick={() => setActiveTab('active')}
  sx={{
    borderRadius:'100px',
    ...(activeTab === 'active'
      ? { background: '#be8221ff', color: 'white' } 
      : { borderColor: '#be8221ff', color: '#be8221ff' } 
    ),
  }}
>
  Активные авторы
</Button>

<Button
  variant={activeTab === 'popular' ? 'contained' : 'outlined'}
  size="small"
  startIcon={<Person />}
  onClick={() => setActiveTab('popular')}
  sx={{
        borderRadius:'100px',

    ...(activeTab === 'popular'
      ? { background: '#be8221ff', color: 'white' } 
      : { borderColor: '#be8221ff', color: '#be8221ff' } 
    ),
  }}
>
  Популярные юзеры
</Button>

    </Box>
  );

const getAvatarUrl = (user) => {
  if (!user?.avatarUrl) return undefined;
  if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
  if (user.avatarUrl.startsWith('/')) return `https://atomglidedev.ru${user.avatarUrl}`;
  return undefined;
};

const renderUserCard = (user, index, type = 'default') => {
  return (
    <Card 
      key={user._id}
                      sx={{ bgcolor: 'rgb(37,37,37)', borderRadius: 5,mb:1 }}

    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={`#${index + 1}`} 
              size="small" 
              sx={{ 
                mr: 1, 
                bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'grey.700',
                color: index < 3 ? 'black' : 'white',
                fontWeight: 'bold'
              }} 
            />
            <Avatar 
              src={getAvatarUrl(user)} 
              sx={{ width: 55, height: 55, ml:1}}
            >
              {!user?.avatarUrl && user?.username ? user.username[0].toUpperCase() : null}
            </Avatar>
            <Box sx={{ml:1.5}}>
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                {user.username}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                {user.fullName}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            {type === 'active' && (
              <>
                <Chip 
                  label={`${user.postsCount || 0} 📝`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ color: 'success.main' }}
                />
                <Chip 
                  label={`${user.followersCount || 0} 👥`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ color: 'secondary.main' }}
                />
              </>
            )}
            {type === 'popular' && (
              <>
                <Chip 
                  label={`${user.followersCount || 0} 👥`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ color: 'secondary.main' }}
                />
                <Chip 
                  label={`${user.postsCount || 0} 📝`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ color: 'success.main' }}
                />
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};


  const renderActiveUsers = () => (
    <Box>
  
      {activeUsers.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center', py: 3 }}>
          Пока нет активных пользователей
        </Typography>
      ) : (
        activeUsers.map((user, index) => renderUserCard(user, index, 'active'))
      )}
    </Box>
  );

  const renderPopularUsers = () => (
    <Box>
   
      {popularUsers.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center', py: 3 }}>
          Пока нет популярных пользователей
        </Typography>
      ) : (
        popularUsers.map((user, index) => renderUserCard(user, index, 'popular'))
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 2 
      }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={loadRatingData} variant="outlined" sx={{ mt: 1 }}>
          Повторить
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
        
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
        pl: 2,
        pr: 2,
        pt: isMobile ? 1 : 2,
        mt: isMobile ? 0 : 0,
      }}>
      
      <Typography variant="h5" sx={{ color: 'white', mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEvents sx={{ fontSize: 28, color: 'gold' }} />
        Рейтинг
      </Typography>
      <Divider sx={{ borderColor: 'rgba(209,209,209,0.1)', mb: 2 }} />

      {renderTabs()}

      {activeTab === 'active' && renderActiveUsers()}
      {activeTab === 'popular' && renderPopularUsers()}

      <Button 
        variant="outlined" 
        fullWidth 
        sx={{ mt: 2, mb: 5 }}
        onClick={loadRatingData}
        startIcon={<TrendingUp />}
      >
        Обновить рейтинг
      </Button>
    </Box>
  );
};

export default Reting;
/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
