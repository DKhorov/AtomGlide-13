import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  Alert,
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Если есть @mui/icons-material
import { checkSubscription, purchaseSubscription } from '../utils/subscription';

const SubscriptionPurchase = ({ open, onClose }) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) loadSubscriptionInfo();
  }, [open]);

  const loadSubscriptionInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const info = await checkSubscription();
      setSubscriptionInfo(info);
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (duration) => {
    setPurchasing(true);
    setError('');
    setSuccess('');
    try {
      const result = await purchaseSubscription(duration);
      if (result.requiresTelegram) {
        window.open(result.telegramUrl || 'https://t.me/jpegweb', '_blank');
        setSuccess('Завершите оплату в Telegram');
      } else if (result.success) {
        setSuccess('Активировано!');
        await loadSubscriptionInfo();
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      setError('Ошибка транзакции');
    } finally {
      setPurchasing(false);
    }
  };

  const isActive = subscriptionInfo?.isActive;
  const expiresAt = subscriptionInfo?.expiresAt;
  const daysLeft = expiresAt ? Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const cardStyle = {
    bgcolor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    p: 2,
    transition: 'transform 0.2s, border-color 0.2s',
    '&:hover': {
      borderColor: 'rgba(237, 93, 25, 0.5)',
      transform: 'translateY(-2px)'
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0d0d0d',
          backgroundImage: 'none',
          color: '#fff',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.5px', fontSize: '1.1rem' }}>
          Atom<span style={{ color: '#ed5d19' }}>Pro+</span>
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'grey.500' }} size="small">
           <Typography variant="body2">✕</Typography>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 4 }}>
        {error && <Alert severity="error" variant="filled" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" variant="filled" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}

        {isActive ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ mb: 2, color: '#4caf50', fontSize: '3rem' }}>✓</Box>
            <Typography variant="h6" gutterBottom>Подписка активна</Typography>
            <Typography variant="body2" sx={{ color: 'grey.500', mb: 3 }}>
              До {expiresAt?.toLocaleDateString('ru-RU')} ({daysLeft} дн.)
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, lineHeight: 1.6 }}>
              Разблокируйте профессиональные инструменты для работы с контентом без ограничений.
            </Typography>

            <Box sx={{ mb: 3 }}>
               {[
                 ['Загрузка файлов', 'до 50 MB'],
                 ['Приоритетная обработка', 'Включено'],
                 ['Эксклюзивные функции', 'Доступны']
               ].map(([label, value], i) => (
                 <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                   <Typography variant="caption" sx={{ color: 'grey.500' }}>{label}</Typography>
                   <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                 </Box>
               ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* План 1 */}
              <Card sx={cardStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'grey.300' }}>Недельный доступ</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>300 ATM</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handlePurchase('week')}
                  disabled={purchasing}
                  sx={{ 
                    bgcolor: '#fff', 
                    color: '#000', 
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#e0e0e0' },
                    borderRadius: '8px'
                  }}
                >
                  {purchasing ? <CircularProgress size={20} /> : 'Активировать'}
                </Button>
              </Card>

              {/* План 2 */}
              <Card sx={{ ...cardStyle, borderColor: 'rgba(237, 93, 25, 0.3)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'grey.300' }}>Месячный доступ</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#ed5d19' }}>$0.99</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ bgcolor: 'rgba(237, 93, 25, 0.1)', color: '#ed5d19', px: 1, py: 0.5, borderRadius: '4px' }}>
                    Выгодно
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handlePurchase('month')}
                  disabled={purchasing}
                  sx={{ 
                    borderColor: '#ed5d19', 
                    color: '#ed5d19',
                    '&:hover': { borderColor: '#ff7d47', bgcolor: 'rgba(237, 93, 25, 0.05)' },
                    borderRadius: '8px'
                  }}
                >
                  Купить через Telegram
                </Button>
              </Card>
            </Box>
          </Box>
        )}

        {subscriptionInfo?.balance !== undefined && (
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'grey.600' }}>
            Ваш текущий баланс: <strong>{subscriptionInfo.balance} ATM</strong>
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPurchase;
