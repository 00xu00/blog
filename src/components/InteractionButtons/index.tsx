import React from 'react';
import { Button, Space } from 'antd';
import { LikeOutlined, LikeFilled, StarOutlined, MessageOutlined } from '@ant-design/icons';
import './index.css';

export interface InteractionButtonsProps {
  initialLikes: number;
  initialStars: number;
  initialComments: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  onLikeClick?: () => void;
  onStarClick?: () => void;
  onCommentClick?: () => void;
}

const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  initialLikes,
  initialStars,
  initialComments,
  isLiked = false,
  isFavorited = false,
  onLikeClick,
  onStarClick,
  onCommentClick
}) => {
  return (
    <div className="interaction-buttons">
      <Space size="large">
        <Button
          type={isLiked ? "primary" : "default"}
          icon={isLiked ? <LikeFilled className="active" /> : <LikeOutlined />}
          onClick={onLikeClick}
          className={isLiked ? "liked" : ""}
        >
          {initialLikes}
        </Button>
        <Button
          type={isFavorited ? "primary" : "default"}
          icon={<StarOutlined />}
          onClick={onStarClick}
        >
          {initialStars}
        </Button>
        <Button
          icon={<MessageOutlined />}
          onClick={onCommentClick}
        >
          {initialComments}
        </Button>
      </Space>
    </div>
  );
};

export default InteractionButtons; 