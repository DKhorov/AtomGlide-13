import React, { useState, useMemo, useCallback, memo } from 'react';
import { Box, Typography, IconButton, Modal, Backdrop, Fade, Button } from '@mui/material';
import PostHeader from './PostHeader';
import PostText from './PostText';
import PostPhoto from './PostPhoto';
import CommentSection from '../../../components/CommentSection';
import axios from '../../../system/axios';
import { FiMessageSquare } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../system/redux/slices/getme'; 

const PostWithComments = memo(({ post, onDelete, onPostUpdate }) => {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();
  
  const user = useSelector(selectUser);
  const userId = user?._id;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const safePost = useMemo(() => ({
    ...post,
    user: post?.user || {},
    likes: { count: post.likes?.count || 0, users: post.likes?.users || [] },
    dislikes: { count: post.dislikes?.count || 0, users: post.dislikes?.users || [] },
    commentsCount: post?.commentsCount || 0
  }), [post]);

  const [localLikes, setLocalLikes] = useState(safePost.likes.count);
  const [localDislikes, setLocalDislikes] = useState(safePost.dislikes.count);
  const [localCommentsCount, setLocalCommentsCount] = useState(safePost.commentsCount);
  const [showComments, setShowComments] = useState(false);

  const [userReaction, setUserReaction] = useState(() => {
    if (!userId) return null;
    if (safePost.likes.users.includes(userId)) return 'like';
    if (safePost.dislikes.users.includes(userId)) return 'dislike';
    return null;
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleReaction = useCallback(async (type) => {
    if (!userId) {
      handleOpenModal();
      return;
    }
    if (type === 'like') {
      setLocalLikes(prev => userReaction === 'like' ? prev - 1 : prev + 1);
      if (userReaction === 'dislike') setLocalDislikes(prev => prev - 1);
      setUserReaction(userReaction === 'like' ? null : 'like');
    } else {
      setLocalDislikes(prev => userReaction === 'dislike' ? prev - 1 : prev + 1);
      if (userReaction === 'like') setLocalLikes(prev => prev - 1);
      setUserReaction(userReaction === 'dislike' ? null : 'dislike');
    }

    try {
      const token = localStorage.getItem('token');
      if (!token || !safePost._id) return;

      const endpoint = `posts/${safePost._id}/${type}`;
      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.post) {
        onPostUpdate({
          ...safePost,
          ...response.data.post,
          user: safePost.user
        });
      }
    } catch (error) {
      console.error(`Ошибка ${type}:`, error);
      if (type === 'like') {
        setLocalLikes(prev => userReaction === 'like' ? prev + 1 : prev - 1);
        if (userReaction === 'dislike') setLocalDislikes(prev => prev + 1);
      } else {
        setLocalDislikes(prev => userReaction === 'dislike' ? prev + 1 : prev - 1);
        if (userReaction === 'like') setLocalLikes(prev => prev + 1);
      }
      setUserReaction(userReaction);
    }
  }, [userId, userReaction, safePost._id, safePost.user, onPostUpdate]);

  const handleCommentClick = useCallback(() => {
    if (!userId) {
      handleOpenModal();
      return;
    }
    setShowComments(prev => !prev);
  }, [userId]);

  const handleCommentCountUpdate = useCallback((newCount) => {
    if (onPostUpdate) {
      onPostUpdate({
        ...post,
        commentsCount: newCount,
        user: safePost.user 
      });
    }
    setLocalCommentsCount(newCount);
  }, [post, safePost.user, onPostUpdate]);

  const commentsText = useMemo(() => {
    const count = localCommentsCount;
    if (!count || count === 0) return 'Нет комментариев';
    if (count % 10 === 1 && count % 100 !== 11) return `${count} комментарий`;
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} комментария`;
    return `${count} комментариев`;
  }, [localCommentsCount]);

  return (
    <Box sx={{
      backgroundColor: "var(--theme-surface)",
      border: "1px solid var(--theme-border)",
      borderRadius: 4,
      mb: 0,
      position: 'relative',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      p: 2,
      pb: 1.5,
      '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.2)' },
    }}>
      <PostHeader
        post={post}
        onDelete={onDelete}
        onPostUpdate={onPostUpdate}
        onCommentClick={handleCommentClick}
      />
      <PostText postId={post._id} >
        {post.title || 'Этот пост не имеет текст :/'}
      </PostText>
      
      {(post.imageUrl || post.videoUrl) && <PostPhoto post={post} sx={{ mb: 1 }} />}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', mt: 2 ,ml:1,mb:1}}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleCommentClick}>
          <FiMessageSquare 
            style={{ fontSize: 25, color: showComments ? '#42a5f5' : 'rgba(84, 163, 247, 1)', marginRight: 8 }} 
          />
          <Typography sx={{ fontSize: '13px', color: showComments ? '#42a5f5' : 'rgba(84, 163, 247, 1)' }}>
            {commentsText}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: '40px',
              height: '40px',
              borderRadius: '100px',
              backgroundColor: 'rgba(66, 165, 245, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mr: 2,
              position: 'relative',
              cursor:'pointer'
            }}
            onClick={() => handleReaction('like')}
            onMouseEnter={() => setHovered('like')}
            onMouseLeave={() => setHovered(null)}
          >
            <Typography sx={{ fontWeight: 'bold', color: '#42a5f5',fontSize:'15px' ,fontFamily:'sf',cursor:'pointer'}}>
              {localLikes}
            </Typography>
          </Box>

          <Box
            sx={{
              width: '40px',
              height: '40px',
              borderRadius: '100px',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
            onClick={() => handleReaction('dislike')}
            onMouseEnter={() => setHovered('dislike')}
            onMouseLeave={() => setHovered(null)}
          >
            <Typography sx={{ fontWeight: 'bold', color: '#f44336',fontSize:'15px' ,fontFamily:'sf' ,cursor:'pointer' }}>
              {localDislikes}
            </Typography>
          </Box>
        </Box>
      </Box>

      {showComments && (
        <CommentSection
          postId={post._id}
          postAuthorId={post.user._id}
          onCommentCountUpdate={handleCommentCountUpdate}
        />
      )}

  
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={isModalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#fff',
            // Фон из PICO1 и PICO2
            backgroundColor: '#000',
            backgroundImage: `url(/PICO1.png), url(/PICO2.png)`,
            backgroundRepeat: 'repeat, repeat',
            backgroundSize: '200px 200px, 200px 200px',
            backgroundPosition: '0 0, 100px 100px',
          }}>
            <Typography sx={{ fontSize: '22px', fontWeight: 800, mb: 1, fontFamily: 'sf' }}>
              Нужен аккаунт
            </Typography>
            <Typography sx={{ fontSize: '15px', mb: 3, opacity: 0.9, fontFamily: 'sf' }}>
              Чтобы просмотреть мнения пользователей на счет этого поста и ставить реакции, пожалуйста, войдите в систему.
            </Typography>
            
            <Button 
              fullWidth
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#866023ff',
                borderRadius: '12px',
                py: 1.5,
                mb: 1.5,
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#c38115ff' }
              }}
            >
              Войти в аккаунт
            </Button>
            
            <Button 
              fullWidth
              onClick={handleCloseModal}
              sx={{
                color: '#fff',
                opacity: 0.7,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Позже
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.post._id === nextProps.post._id &&
    prevProps.post.likes?.count === nextProps.post.likes?.count &&
    prevProps.post.dislikes?.count === nextProps.post.dislikes?.count &&
    prevProps.post.commentsCount === nextProps.post.commentsCount &&
    prevProps.post.imageUrl === nextProps.post.imageUrl &&
    prevProps.post.videoUrl === nextProps.post.videoUrl
  );
});

PostWithComments.displayName = 'PostWithComments';

export default PostWithComments;