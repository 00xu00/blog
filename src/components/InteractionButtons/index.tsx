import React, { useState } from 'react';
import { Button, Space, Tooltip, message } from 'antd';
import { LikeOutlined, StarOutlined, CommentOutlined } from '@ant-design/icons';
import './index.css';

interface InteractionButtonsProps {
  initialLikes?: number;
  initialStars?: number;
  initialComments?: number;
  onCommentClick?: () => void;
}

const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  initialLikes = 0,
  initialStars = 0,
  initialComments = 0,
  onCommentClick
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [stars, setStars] = useState(initialStars);
  const [isLiked, setIsLiked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1);
      message.success('取消点赞');
    } else {
      setLikes(prev => prev + 1);
      message.success('点赞成功');
    }
    setIsLiked(!isLiked);
  };

  const handleStar = () => {
    if (isStarred) {
      setStars(prev => prev - 1);
      message.success('取消收藏');
    } else {
      setStars(prev => prev + 1);
      message.success('收藏成功');
    }
    setIsStarred(!isStarred);
  };

  return (
    <Space className="interaction-buttons">
      <Tooltip title={isLiked ? '取消点赞' : '点赞'}>
        <Button
          type="text"
          icon={<LikeOutlined className={isLiked ? 'active' : ''} />}
          onClick={handleLike}
        >
          {likes}
        </Button>
      </Tooltip>
      <Tooltip title={isStarred ? '取消收藏' : '收藏'}>
        <Button
          type="text"
          icon={<StarOutlined className={isStarred ? 'active' : ''} />}
          onClick={handleStar}
        >
          {stars}
        </Button>
      </Tooltip>
      <Tooltip title="评论">
        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={onCommentClick}
        >
          {initialComments}
        </Button>
      </Tooltip>
    </Space>
  );
};

export default InteractionButtons; 