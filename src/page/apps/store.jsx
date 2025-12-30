import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, MenuItem, Select,
  useMediaQuery, FormControl, Grow, Fade, Modal, Backdrop, Fade as MuiFade,
  Table, TableBody, TableRow, TableCell
} from '@mui/material';
import axios from '../../system/axios';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const isMobile = useMediaQuery('(max-width:900px)');
  const [sortBy, setSortBy] = useState("new");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("/store/products");
    setProducts(res.data);
  };

  const groupedProducts = Object.values(
    products.reduce((acc, item) => {
      const key = item.title;
      if (!acc[key]) acc[key] = { ...item, quantity: 0, sold: 0, items: [] };
      acc[key].quantity += item.quantity;
      acc[key].sold += item.sold;
      acc[key].items.push(item);
      return acc;
    }, {})
  );

  const sortedGroups = [...groupedProducts].sort((a, b) => {
    if (a.sold >= a.quantity && b.sold < b.quantity) return 1;
    if (a.sold < a.quantity && b.sold >= b.quantity) return -1;
    if (sortBy === "expensive") return b.price - a.price;
    if (sortBy === "cheap") return a.price - b.price;
    if (sortBy === "new") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "old") return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  const handleBuy = async (productId) => {
    try {
      await axios.post(`/store/products/${productId}/buy`, {}, { withCredentials: true });
      setPurchaseSuccess(true);
      fetchProducts();
      setConfirmModalOpen(false);
      setTimeout(() => setPurchaseSuccess(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка при покупке");
    }
  };

  const openConfirmModal = (product) => {
    setSelectedProduct(product);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setSelectedProduct(null);
    setConfirmModalOpen(false);
  };

  if (currentCollection) {
    const itemsSorted = [...currentCollection.items].sort((a, b) => {
      const aSold = a.sold >= a.quantity;
      const bSold = b.sold >= b.quantity;
      if (aSold && !bSold) return 1;
      if (!aSold && bSold) return -1;
      return 0;
    });

    return (
      <Box sx={{
        width: isMobile ? '100vw' : '700px',
        maxWidth: isMobile ? '100vw' : '700px',
        minWidth: isMobile ? '0' : '200px',
        height: '100vh',
        flex: isMobile ? 1 : 'none',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { width: '0px', background: 'transparent' },
        paddingBottom: isMobile ? '70px' : 0,
        pl: 0, pr: 0, px: 1, pt: isMobile ? 1 : 0, mt: 2
      }}>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ color: 'white', fontSize: '22px', fontWeight: '600', mb: 2 }}>
            Коллекция: {currentCollection.title}
          </Typography>
          <Typography
            variant="outlined"
            sx={{ ml: 5, color: '#be8221ff', borderColor: 'white', mt: 0.6, cursor: 'pointer' }}
            onClick={() => setCurrentCollection(null)}
          >
            Назад к стопкам
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: isMobile ? 'center' : 'flex-start',
          maxWidth: isMobile ? '100vw' : '700px',
          margin: '0 auto',
        }}>
          {itemsSorted.map(item => {
            const soldOut = item.sold >= item.quantity;
            return (
              <Grow in key={item._id}>
               <Box
  sx={{
    flex: isMobile ? '1 1 100%' : '1 1 calc(33.333% - 16px)',
    maxWidth: isMobile ? '100%' : '220px',
    minWidth: isMobile ? '0' : '220px',
    height: '320px',
    margin: 'auto',
    borderRadius: '20px',
    overflow: 'hidden',
    backgroundColor: 'rgba(56, 64, 73, 0.42)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2.5,
    textAlign: 'center',
  }}
>
  <img
    src={item.imageUrl}
    alt={item.title}
    style={{
      width: '140px',
      height: '140px',
      borderRadius: '16px',
      marginTop: '8px',
      objectFit: 'contain',
      padding: '6px',
    }}
  />
<Typography
    sx={{
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '1.5rem',
      
    }}
  >
  {item.title}
  </Typography>
  <Typography
    sx={{
      color: 'white',
      fontWeight: '700',
      fontSize: '1rem',
      mt: 0.5,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '50px',
      px: 2.5,
      py: 0.5,
      textShadow: '0 0 6px rgba(255,255,255,0.2)',
    }}
  >
    💎 {item.price} atm
  </Typography>

  

  {soldOut ? (
    <Typography
      sx={{
        color: 'red',
        fontWeight: 'bold',
        mt: 1,
      }}
    >
      Продано
    </Typography>
  ) : (
    <Button
      variant="contained"
      sx={{
        mt: 1,
        background: '#be8221ff',
        borderRadius: '50px',
        fontSize: '0.8rem',
        fontWeight: 600,
        textTransform: 'none',
        px: 3,
        boxShadow: '0 3px 10px rgba(34,158,217,0.4)',
        '&:hover': {
          background: '#ff9d00ff',
          boxShadow: '0 4px 12px #ff9d00ff',
        },
      }}
      onClick={() => openConfirmModal(item)}
    >
      Купить 
    </Button>
  )}
</Box>

              </Grow>
            )
          })}
        </Box>
        <Modal
          open={confirmModalOpen}
          onClose={closeConfirmModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <MuiFade in={confirmModalOpen}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '90%' : 400,
              bgcolor: 'rgba(28,28,28,1)',
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
            }}>
              {selectedProduct && (
                <>
                  <center>                  <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: '120px', height: '120px', borderRadius: 8, marginBottom: '10px' }} />
</center>
                  <Typography sx={{ color: 'white', fontWeight: '600', fontSize: 18 }}>{selectedProduct.title}</Typography>
                  <Typography sx={{ color: 'gray', fontSize: 14, mb: 1 }}>{selectedProduct.description}</Typography>
                <Table sx={{ color: 'white', mb: 2 }}>
      <TableBody>
        <TableRow>
          <TableCell sx={{ color: 'white', fontSize: 15 }}>Цена:</TableCell>
          <TableCell sx={{ color: 'gold', fontSize: 16 }}>{selectedProduct.price} atm</TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ color: 'white', fontSize: 15}}>Продавец:</TableCell>
          <TableCell sx={{ color: 'gray', fontSize: 15 }}>{selectedProduct.seller || "AtomGlide"}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ color: 'white', fontSize: 15}}>Владелец:</TableCell>
          <TableCell sx={{ color: 'gray', fontSize: 15 }}>{"AtomGlide"}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ color: 'white', fontSize: 15 }}>Налог:</TableCell>
          <TableCell sx={{ color: 'gray', fontSize: 15 }}>0 atm</TableCell>
        </TableRow>
      </TableBody>
    </Table>
                  <Button
                    variant="contained"
                    sx={{ background: '#be8221ff', borderRadius: '8px', mt: 1 }}
                    onClick={() => handleBuy(selectedProduct._id)}
                  >
                    Подтвердить покупку
                  </Button>
                                    <Typography sx={{ color: 'gray', fontSize: '12px',mt:1 }}>Биржа: AtomGlide Network</Typography>

                </>
              )}
            </Box>
          </MuiFade>
        </Modal>
        <Fade in={purchaseSuccess}>
          <Box sx={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4caf50',
            color: 'white',
            px: 4,
            py: 2,
            borderRadius: '12px',
            fontWeight: 600,
            zIndex: 9999
          }}>
            Успешно.
          </Box>
        </Fade>
      </Box>
    )
  }

  return (
    <Box sx={{
      width: isMobile ? '100vw' : '700px',
      maxWidth: isMobile ? '100vw' : '700px',
      minWidth: isMobile ? '0' : '200px',
      height: '100vh',
      flex: isMobile ? 1 : 'none',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': { width: '0px', background: 'transparent' },
      paddingBottom: isMobile ? '70px' : 0,
      pl: 0, pr: 0, px: 1, pt: isMobile ? 1 : 0, mt: isMobile ? 2 : 0,
    }}>
       <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: { xs: 'space-between', sm: 'space-between' },
        gap: 1.5,
        mb: 2,
        mt: 1
      }}
    >
      <Typography
        sx={{
          color: 'white',
          fontSize: '22px',
          fontWeight: 600,
          mb: { xs: 0.5, sm: 0 },
        }}
      >
        Магазин AtomStore
      </Typography>

      <FormControl
        size="small"
        sx={{
          minWidth: 150,
          '& .MuiInputBase-root': {
            height: 32,
            fontSize: '14px',
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'white',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'gray',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#be8221ff',
          },
          '& .MuiSelect-icon': {
            color: 'white',
          },
        }}
      >
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          displayEmpty
        >
          <MenuItem disabled>Сортировать</MenuItem>
          <MenuItem value="expensive">Дорогие → дешёвые</MenuItem>
          <MenuItem value="cheap">Дешёвые → дорогие</MenuItem>
          <MenuItem value="new">Новые → старые</MenuItem>
          <MenuItem value="old">Старые → новые</MenuItem>
        </Select>
      </FormControl>
    </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {sortedGroups.map(group => {
          const isSoldOut = group.sold >= group.quantity;
          return (
            <Grow in key={group.title}>
              <Box
  sx={{
    flex: isMobile ? '1 1 100%' : '1 1 calc(33.333% - 16px)',
    maxWidth: isMobile ? '100%' : '220px',
    minWidth: isMobile ? '0' : '220px',
    height: '270px',
    margin: 'auto',
    borderRadius: '20px',
    overflow: 'hidden',
                  backgroundColor: 'rgba(56, 64, 73, 0.42)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2.5,
  }}
  onClick={() => setCurrentCollection(group)}
>
 <img
  src={group.imageUrl}
  alt={group.title}
  style={{
    width: '140px',
    height: '140px',
    borderRadius: '16px',
    marginTop: '8px',
    objectFit: 'contain', 
    padding: '6px', 
  }}
/>


  <Typography
    sx={{
      color: 'white',
      fontWeight: '700',
      fontSize: '1rem',
      mt: 0.5,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '50px',
      px: 2.5,
      py: 0.5,
      textShadow: '0 0 6px rgba(255,255,255,0.2)',
    }}
  >
    💎 {group.price}
  </Typography>

  <Typography
    sx={{
      color: 'rgba(200,200,200,0.8)',
      fontSize: '0.85rem',
      mt: -2,
    }}
    variant='body2'
  >
    Осталось {group.quantity - group.sold} / {group.quantity} шт.
  </Typography>

 
</Box>

            </Grow>
          )
        })}
      </Box>
      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}>
        Все покупки приобретаются за внутреннюю валюту — atm. Цены в магазине регулируются установленными нормативами торговли в сети AtomGlide Network. Все платежи проходят модерацию с целью исключения использования нечестно заработанной валюты. 1 atm ≈ 0,01 USDT.
      </Typography>
      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}>
        Товары в магазине не являются офертой. Все покупки носят исключительно развлекательный характер и не являются основанием для возникновения имущественных прав. К каждому товару прилагается свой уникальный номер владельца, при покупке номер продаваца переходит к покупателю. После покупки вы являетесь единственным владельцем приобретенного товара. В случае нарушения правил магазина администрация оставляет за собой право аннулировать покупку и изъять товар без компенсации. Магазин не поддерживает возврат средств за приобретенные товары. Товары стоймостью менее 1000 atm проходят особую проверку покупателя на подтверждение легальности средств через админов лс в тг . Товары в магазин поставляются через официальных поставщиков, все продавци имеют лицензию на торговлю цифровыми товарами. А также прошли проверку администрации AtomGlide.
      </Typography>
      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}>
        © 2025 DK Studio. Все права защищены.
      </Typography>
    </Box>
  )
};

export default Store;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
