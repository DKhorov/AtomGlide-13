import React, { useRef, useState, useEffect, useMemo } from 'react'; 
import { Box, IconButton, Modal, Typography, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const getMediaType = (post) => {
    if (post?.videoUrl) return 'video';
    if (post?.imageUrl) return 'image';
    return 'none'; 
};

const getMediaFullUrl = (relativeUrl, isVideo) => {
    if (!relativeUrl) return undefined;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const baseDomain = 'https://atomglidedev.ru'; 
    const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    return `${baseDomain}${cleanUrl}`; 
};

const getAvatarUrl = (relativeUrl) => {
    if (!relativeUrl) return undefined;
    const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    return relativeUrl.startsWith('http') 
        ? relativeUrl 
        : `https://atomglidedev.ru${cleanUrl}`;
};

const PostPhoto = ({ post, isLCP = false, postIndex = 0 }) => {
  const mediaRef = useRef(null); 
  const [mediaError, setMediaError] = useState(false);
  const [open, setOpen] = useState(false);
  const [isBlured, setIsBlured] = useState(true); 
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const mediaType = useMemo(() => getMediaType(post), [post]);
  const isVideo = mediaType === 'video';
  const isImage = mediaType === 'image';
  const rawUrl = isVideo ? post?.videoUrl : post?.imageUrl;
  const mediaUrl = useMemo(() => getMediaFullUrl(rawUrl, isVideo), [rawUrl, isVideo]);
  const hasMedia = Boolean(mediaUrl);
  const shouldLoadEagerly = postIndex < 10; 

  useEffect(() => {
    if (!hasMedia || !mediaRef.current || !isImage) return; 
    const media = mediaRef.current;
    if (media.complete) {
      setIsBlured(false); 
    }
  }, [mediaUrl, hasMedia, isImage]);

  const handleMediaLoad = () => {
    if (isImage) {
        setMediaError(false);
        setTimeout(() => setIsBlured(false), 50); 
    }
  };
    
  const handleCanPlay = () => {
    const video = mediaRef.current;
    if (video && isPlaying) {
        video.play().catch(() => {});
    }
    setTimeout(() => setIsBlured(false), 50); 
  }

  const handleMediaError = () => {
    setMediaError(true);
    setIsBlured(false);
  };

  const togglePlay = (e) => {
    e.stopPropagation(); 
    const video = mediaRef.current;
    if (video) {
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    }
  };

  const handleContainerClick = () => {
    if (isVideo) {
        setIsMuted(!isMuted);
    } else {
        setOpen(true); 
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!hasMedia) return null;

  const MediaElement = isVideo ? 'video' : 'img';
  
  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          marginTop: '5px',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0',
          borderRadius: '20px',
          position: 'relative',
          backgroundColor: 'rgba(78, 78, 78, 0.23)',
          transition: 'filter 0.5s ease-out, transform 0.3s',
          filter: isBlured && !mediaError ? 'blur(10px) brightness(0.9)' : 'blur(0px)',
          transform: isBlured && !mediaError ? 'scale(1.02)' : 'scale(1)',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onClick={handleContainerClick}
      >

        {mediaError && (
          <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            Медиа недоступно
          </Box>
        )}

        <MediaElement
          ref={mediaRef}
          src={mediaUrl}
          alt="post-media"
          {...(isVideo && {
              controls: false, 
              loop: true,
              muted: isMuted,
              playsInline: true,
              autoPlay: true, 
              onCanPlay: handleCanPlay, 
              preload: 'auto',
          })}
          style={{
            width: '100%',
            height: '440px',
            maxWidth: '100%',
            maxHeight: 500,
            objectFit: isVideo ? 'cover' : 'contain', 
            borderRadius:'20px',
            transition: 'opacity 0.5s ease-in-out',
            display: 'block', 
            margin: '0 auto',
            opacity: isBlured ? 0.01 : 1, 
          }}
          onLoad={handleMediaLoad} 
          onError={handleMediaError}
          {...(isImage && shouldLoadEagerly ? { 
            loading: 'eager',
            fetchPriority: postIndex < 3 ? 'high' : 'auto'
          } : isImage ? { 
            loading: 'lazy',
            decoding: 'async'
          } : {} )} 
        />
        
        {isVideo && !isBlured && (
            <IconButton
                onClick={togglePlay}
                sx={{
                    position: 'absolute',
                    top: 15,
                    right: 15,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                    backdropFilter: 'blur(4px)',
                    zIndex: 2
                }}
            >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
        )}

        {isVideo && !isBlured && (
             <Box
                sx={{
                    position: 'absolute',
                    bottom: 15,
                    left: 15,
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '12px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pointerEvents: 'none', 
                }}
            >
                {isMuted ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
                <Typography sx={{ fontSize: '11px', fontWeight: 500 }}>
                    {isMuted ? 'нажмите чтобы включить звук' : 'звук включен'}
                </Typography>
            </Box>
        )}
        
      </Box>

      <Modal open={open} onClose={handleClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', padding: 2, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            {post?.user?.avatarUrl && (
              <Avatar src={getAvatarUrl(post.user.avatarUrl)} sx={{ width: 40, height: 40, marginRight: 2 }} />
            )}
            <Typography variant="h6" color="white">
              {post?.user?.fullName || post?.user?.username || 'AtomGlide Post'}
            </Typography>
            <IconButton sx={{ marginLeft: 'auto', color: 'white' }} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, overflow: 'hidden' }}>
            <img src={mediaUrl} alt="full" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PostPhoto;