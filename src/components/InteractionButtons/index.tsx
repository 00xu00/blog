import React from 'react';
import { Button, Space } from 'antd';
import { LikeOutlined, LikeFilled, StarOutlined, MessageOutlined } from '@ant-design/icons';
import './index.css';

export interface InteractionButtonsProps {
  initialLikes: number;
  initialStars: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  isCommented?: boolean;
  onLikeClick?: () => void;
  onStarClick?: () => void;
  onCommentClick?: () => void;
}

const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  initialLikes,
  initialStars,
  isLiked = false,
  isFavorited = false,
  isCommented = false,
  onLikeClick,
  onStarClick,
  onCommentClick
}) => {
  return (
    <div className="interaction-buttons">
      <Space size="large">
        <Button
          type={isLiked ? "primary" : "default"}
          icon={<LikeOutlined />}
          onClick={onLikeClick}
          className={isLiked ? "liked" : ""}
        >
          {initialLikes}
        </Button>
        <Button
          type={isFavorited ? "primary" : "default"}
          className={isFavorited ? "liked" : ""}
          icon={<StarOutlined />}
          onClick={onStarClick}
        >
          {initialStars}
        </Button>
        <Button
          type={isCommented ? "primary" : "default"}
          className={isCommented ? "liked" : ""}
          icon={<MessageOutlined />}
          onClick={onCommentClick}
        >
        </Button>
      </Space>
    </div>
  );
};

export default InteractionButtons; 