import React, { useState } from 'react';
import { Avatar, Button, Input, List, Space, Tooltip, message } from 'antd';
import { UserOutlined, LikeOutlined, DislikeOutlined, CloseOutlined } from '@ant-design/icons';
import './index.css';

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  replies?: Comment[];
}

interface ReplyState {
  commentId: number;
  replyTo?: string;
  replyId?: number;
  isReplyToReply?: boolean;
  content: string;
}

const Comments: React.FC = () => {
  const [comment, setComment] = useState('');
  const [replyState, setReplyState] = useState<ReplyState | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: {
        name: '用户1',
        avatar: '',
      },
      content: '这是一条评论',
      time: '2024-04-28 12:00',
      likes: 10,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replies: [
        {
          id: 2,
          user: {
            name: '用户2',
            avatar: '',
          },
          content: '这是一条回复',
          time: '2024-04-28 12:01',
          likes: 5,
          dislikes: 0,
          isLiked: false,
          isDisliked: false,
        },
      ],
    },
  ]);

  const handleComment = () => {
    if (!comment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    const newComment: Comment = {
      id: Date.now(),
      user: {
        name: '当前用户',
        avatar: '',
      },
      content: comment,
      time: new Date().toLocaleString(),
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
    };

    setComments([...comments, newComment]);
    setComment('');
    message.success('评论成功');
  };

  const handleReply = () => {
    if (!replyState?.content.trim()) {
      message.warning('请输入回复内容');
      return;
    }

    const newReply: Comment = {
      id: Date.now(),
      user: {
        name: '当前用户',
        avatar: '',
      },
      content: replyState.content,
      time: new Date().toLocaleString(),
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
    };

    setComments(comments.map(comment => {
      if (comment.id === replyState.commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      return comment;
    }));

    setReplyState(null);
    message.success('回复成功');
  };

  const handleLike = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked,
          dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes,
          isDisliked: false
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                isLiked: !reply.isLiked,
                dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes,
                isDisliked: false
              };
            }
            return reply;
          }),
        };
      }
      return comment;
    }));
  };

  const handleDislike = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
          isDisliked: !comment.isDisliked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes,
          isLiked: false
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
                isDisliked: !reply.isDisliked,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes,
                isLiked: false
              };
            }
            return reply;
          }),
        };
      }
      return comment;
    }));
  };

  const startReply = (commentId: number, replyTo?: string, replyId?: number, isReplyToReply: boolean = false) => {
    setReplyState({
      commentId,
      replyTo,
      replyId,
      isReplyToReply,
      content: '',
    });
  };

  const cancelReply = () => {
    setReplyState(null);
  };

  return (
    <div className="comments-container">
      <div className="comment-input">
        <Avatar icon={<UserOutlined />} />
        <Input.TextArea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="说点什么..."
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
        <Button type="primary" onClick={handleComment}>
          评论
        </Button>
      </div>

      <List
        className="comment-list"
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={item => (
          <List.Item>
            <div className="comment-item">
              <div className="comment-header">
                <Avatar icon={<UserOutlined />} />
                <span className="comment-user">{item.user.name}</span>
                <span className="comment-time">{item.time}</span>
              </div>
              <div className="comment-content">{item.content}</div>
              <div className="comment-actions">
                <Space>
                  <Tooltip title="点赞">
                    <Button
                      type="text"
                      icon={<LikeOutlined className={item.isLiked ? 'active' : ''} />}
                      onClick={() => handleLike(item.id)}
                    >
                      {item.likes}
                    </Button>
                  </Tooltip>
                  <Tooltip title="点踩">
                    <Button
                      type="text"
                      icon={<DislikeOutlined className={item.isDisliked ? 'active' : ''} />}
                      onClick={() => handleDislike(item.id)}
                    >
                      {item.dislikes}
                    </Button>
                  </Tooltip>
                  <Button type="text" onClick={() => startReply(item.id, item.user.name, item.id)}>
                    回复
                  </Button>
                </Space>
                {replyState?.commentId === item.id && replyState.replyId === item.id && !replyState.isReplyToReply && (
                  <div className="reply-input">
                    <div className="reply-input-header">
                      <span>回复 {replyState.replyTo}</span>
                      <Button type="text" icon={<CloseOutlined />} onClick={cancelReply} />
                    </div>
                    <Input.TextArea
                      value={replyState.content}
                      onChange={e => setReplyState({ ...replyState, content: e.target.value })}
                      placeholder="输入回复内容..."
                      autoSize={{ minRows: 2, maxRows: 6 }}
                    />
                    <div className="reply-input-actions">
                      <Button type="primary" onClick={handleReply}>
                        回复
                      </Button>
                      <Button onClick={cancelReply}>取消</Button>
                    </div>
                  </div>
                )}
              </div>

              {item.replies && item.replies.length > 0 && (
                <div className="comment-replies">
                  {item.replies.map(reply => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-header">
                        <div className="reply-user">
                          <div className="reply-user-avatar">
                            <Avatar size={32} icon={<UserOutlined />} />
                          </div>
                          <span className="reply-user-name">{reply.user.name}</span>
                          <div className="reply-target">
                            <span className="reply-target-name">{item.user.name}</span>
                          </div>
                        </div>
                        <span className="reply-time">{reply.time}</span>
                      </div>
                      <div className="reply-content">{reply.content}</div>
                      <div className="reply-actions">
                        <Space>
                          <Tooltip title="点赞">
                            <Button
                              type="text"
                              icon={<LikeOutlined className={reply.isLiked ? 'active' : ''} />}
                              onClick={() => handleLike(reply.id)}
                            >
                              {reply.likes}
                            </Button>
                          </Tooltip>
                          <Tooltip title="点踩">
                            <Button
                              type="text"
                              icon={<DislikeOutlined className={reply.isDisliked ? 'active' : ''} />}
                              onClick={() => handleDislike(reply.id)}
                            >
                              {reply.dislikes}
                            </Button>
                          </Tooltip>
                          <Button type="text" onClick={() => startReply(item.id, reply.user.name, reply.id, true)}>
                            回复
                          </Button>
                        </Space>
                        {replyState?.commentId === item.id && replyState.replyId === reply.id && replyState.isReplyToReply && (
                          <div className="reply-input">
                            <div className="reply-input-header">
                              <span>回复 {replyState.replyTo}</span>
                              <Button type="text" icon={<CloseOutlined />} onClick={cancelReply} />
                            </div>
                            <Input.TextArea
                              value={replyState.content}
                              onChange={e => setReplyState({ ...replyState, content: e.target.value })}
                              placeholder="输入回复内容..."
                              autoSize={{ minRows: 2, maxRows: 6 }}
                            />
                            <div className="reply-input-actions">
                              <Button type="primary" onClick={handleReply}>
                                回复
                              </Button>
                              <Button onClick={cancelReply}>取消</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Comments; 