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
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { checkSubscription, purchaseSubscription } from '../utils/subscription';

const SubscriptionPurchase = ({ open, onClose }) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      loadSubscriptionInfo();
    }
  }, [open]);

  const loadSubscriptionInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const info = await checkSubscription();
      setSubscriptionInfo(info);
    } catch (err) {
      setError('Ошибка загрузки информации о подписке');
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
        // Перенаправление на Telegram
        window.open(result.telegramUrl || 'https://t.me/jpegweb', '_blank');
        setSuccess('Откройте Telegram для покупки месячной подписки');
      } else if (result.success) {
        setSuccess(result.message || 'Подписка успешно активирована!');
        await loadSubscriptionInfo();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.message || 'Ошибка при покупке подписки');
      }
    } catch (err) {
      setError('Ошибка при покупке подписки');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const isActive = subscriptionInfo?.isActive;
  const expiresAt = subscriptionInfo?.expiresAt;
  const daysLeft = expiresAt ? Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'rgb(237,93,25)' }}>
          AtomPro+ Подписка
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {isActive ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              У вас активна подписка AtomPro+
            </Alert>
            {expiresAt && (
              <Typography variant="body2" color="text.secondary">
                Подписка действительна до: {expiresAt.toLocaleDateString('ru-RU')}
                {daysLeft !== null && daysLeft > 0 && (
                  <span> ({daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'})</span>
                )}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>Преимущества AtomPro+:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Загрузка музыки до 50MB</li>
              <li>Дополнительные возможности</li>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Получите доступ к расширенным возможностям AtomGlide
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Преимущества AtomPro+:</strong>
            </Typography>
            <Box component="ul" sx={{ mb: 3, pl: 2 }}>
              <li>Загрузка музыки до 50MB (обычные пользователи: 10MB)</li>
              <li>Дополнительные возможности</li>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Card sx={{ bgcolor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Неделя - 300 ATM
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Получите все преимущества AtomPro+ на 7 дней
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handlePurchase('week')}
                    disabled={purchasing}
                    sx={{ bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: 'rgb(200,80,20)' } }}
                  >
                    {purchasing ? <CircularProgress size={24} /> : 'Купить за 300 ATM'}
                  </Button>
                </CardContent>
              </Card>

              <Card sx={{ bgcolor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Месяц - $0.99
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Получите все преимущества AtomPro+ на 30 дней
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handlePurchase('month')}
                    disabled={purchasing}
                    sx={{ bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: 'rgb(200,80,20)' } }}
                  >
                    {purchasing ? <CircularProgress size={24} /> : 'Купить за $0.99'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Свяжитесь с @jpegweb в Telegram для покупки
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {subscriptionInfo?.balance !== undefined && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Ваш баланс: {subscriptionInfo.balance} ATM
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionPurchase;

