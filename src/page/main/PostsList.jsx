import { memo, useMemo, useCallback } from 'react'; 
import { Box, Button } from '@mui/material';
import PostWithComments from './post/PostWithComments';
import PostSkeleton from './post/PostSkeleton';
import VirtualizedFeed from '../../components/VirtualizedFeed';

const USE_VIRTUAL_SCROLLING_THRESHOLD = 100; 

const PostsList = memo(({ posts = [], loading, onDelete, onPostUpdate, onLoadMore, hasMore }) => {
  
  const visiblePosts = useMemo(() => Array.isArray(posts) ? posts : [], [posts]);

  const useVirtualScrolling = visiblePosts.length > USE_VIRTUAL_SCROLLING_THRESHOLD;

  const renderPost = useCallback((post) => (
    <Box
      sx={{
        position: 'relative',
        mb: 1,
      }}
    >
      <PostWithComments
        post={post}
        onDelete={onDelete}
        onPostUpdate={onPostUpdate}
      />

      {post.pending && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 20,
            color: 'orange',
            fontSize: 13,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }}
        >
          Отправляется...
        </Box>
      )}
    </Box>
  ), [onDelete, onPostUpdate]);

  if (loading && visiblePosts.length === 0) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </Box>
    );
  }

  if (useVirtualScrolling) {
    return (
      <Box>
        <VirtualizedFeed
          items={visiblePosts}
          renderItem={renderPost}
          estimatedItemSize={400}
          overscanCount={3}
          height="calc(100vh - 200px)"
          width="100%"
          onLoadMore={hasMore ? onLoadMore : undefined}
          hasMore={hasMore}
          scrollPositionKey="posts-feed-scroll"
        />
        
        {hasMore && (
          <Box sx={{ textAlign: 'center', mt: 3, mb: 5 }}>
            <Button
              variant="contained"
              onClick={onLoadMore} 
              sx={{
                borderRadius: '25px',
                px: 4,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                background: 'linear-gradient(135deg, #1e88e5, #42a5f5)',
              }}
            >
              Загрузить ещё
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {visiblePosts.map((post, index) => (
        <Box
          key={`${post._id}-${index}`}
          sx={{
            opacity: 0,
            transform: 'translateY(30px) scale(0.95)',
            animation: `slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s forwards`,
            '@keyframes slideInUp': {
              '0%': { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
              '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
            position: 'relative',
            mb: 1,
          }}
        >
          <PostWithComments
            post={post}
            onDelete={onDelete}
            onPostUpdate={onPostUpdate}
          />

          {post.pending && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 20,
                color: 'orange',
                fontSize: 13,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            >
              Отправляется...
            </Box>
          )}
        </Box>
      ))}


        <Box sx={{ textAlign: 'center', mt: 3, mb: 5 }}>
          <Button
            variant="contained"
            onClick={onLoadMore} 
            sx={{
              borderRadius: '25px',
              px: 4,
              py: 1,
              mb:30,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              background: 'linear-gradient(135deg, #1e88e5, #42a5f5)',
            }}
          >
            Загрузить ещё
          </Button>
        </Box>
      
    </Box>
  );
});

export default PostsList;