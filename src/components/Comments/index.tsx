import React, { useState, useEffect } from 'react';
import { Form, Button, List, Input, message, Avatar, Space } from 'antd';
import { UserOutlined, LikeOutlined, LikeFilled } from '@ant-design/icons';
import { getBlogComments, createComment, likeComment, unlikeComment } from '../../api/comment';
import { formatDate } from '../../utils/date';
import './index.css';

const { TextArea } = Input;

interface CommentsProps {
  blogId: number;
  onCommentCountChange?: (count: number) => void;
}

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    avatar: string;
  };
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  replies: Comment[];
  parent_id?: number;
  parent?: Comment;
}

const Comments: React.FC<CommentsProps> = ({ blogId, onCommentCountChange }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: number; username: string } | null>(null);
  const [form] = Form.useForm();
  const [replyForm] = Form.useForm();

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const response = await getBlogComments(blogId);
      setComments(response.data);
      if (onCommentCountChange) {
        onCommentCountChange(response.data.length);
      }
    } catch (error) {
      message.error('获取评论失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      await createComment({
        blog_id: blogId,
        content: values.content,
        parent_id: replyingTo?.id
      });
      message.success('评论成功');
      form.resetFields();
      replyForm.resetFields();
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      message.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: number) => {
    try {
      // 递归查找评论
      const findComment = (comments: Comment[], id: number): Comment | undefined => {
        for (const comment of comments) {
          if (comment.id === id) {
            return comment;
          }
          if (comment.replies && comment.replies.length > 0) {
            const found = findComment(comment.replies, id);
            if (found) return found;
          }
        }
        return undefined;
      };

      const comment = findComment(comments, commentId);
      if (!comment) return;

      if (comment.is_liked) {
        await unlikeComment(commentId);
        comment.likes_count--;
        comment.is_liked = false;
      } else {
        await likeComment(commentId);
        comment.likes_count++;
        comment.is_liked = true;
      }
      setComments([...comments]);
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 递归获取所有回复
  const getAllReplies = (comment: Comment): Comment[] => {
    let allReplies: Comment[] = [];
    if (comment.replies && comment.replies.length > 0) {
      allReplies = [...comment.replies];
      comment.replies.forEach(reply => {
        allReplies = [...allReplies, ...getAllReplies(reply)];
      });
    }
    return allReplies;
  };

  // 查找评论的父评论
  const findParentComment = (commentId: number): Comment | undefined => {
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment;
      }
      const findInReplies = (replies: Comment[]): Comment | undefined => {
        for (const reply of replies) {
          if (reply.id === commentId) {
            return reply;
          }
          if (reply.replies && reply.replies.length > 0) {
            const found = findInReplies(reply.replies);
            if (found) return found;
          }
        }
        return undefined;
      };
      if (comment.replies && comment.replies.length > 0) {
        const found = findInReplies(comment.replies);
        if (found) return found;
      }
    }
    return undefined;
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const parentComment = findParentComment(comment.parent_id || 0);
    const replyToUsername = parentComment?.author.username;

    return (
      <List.Item>
        <List.Item.Meta
          avatar={
            <Avatar
              src={comment.author.avatar}
              icon={!comment.author.avatar && <UserOutlined />}
              alt={comment.author.username}
              className="comment-avatar"
            />
          }
          title={
            <div>
              <span className="comment-author">{comment.author.username}</span>
              <span className="comment-time" style={{ marginLeft: '10px' }}>
                {formatDate(comment.created_at)}
              </span>
              {isReply && replyToUsername && (
                <span className="reply-to" style={{ marginLeft: '10px', color: '#8c8c8c' }}>
                  回复 {replyToUsername}
                </span>
              )}
            </div>
          }
          description={
            <div>
              <div className="comment-content">{comment.content}</div>
              <Space className="comment-actions">
                <Button
                  type="text"
                  icon={comment.is_liked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                  onClick={() => handleLike(comment.id)}
                >
                  {comment.likes_count > 0 && comment.likes_count}
                </Button>
                <Button
                  type="text"
                  onClick={() => setReplyingTo({ id: comment.id, username: comment.author.username })}
                >
                  回复
                </Button>
              </Space>
              {replyingTo?.id === comment.id && (
                <Form form={replyForm} onFinish={handleSubmit} style={{ marginTop: '10px' }}>
                  <Form.Item name="content" rules={[{ required: true, message: '请输入回复内容' }]}>
                    <TextArea
                      rows={2}
                      placeholder={`回复 ${comment.author.username}...`}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={submitting}>
                        发表回复
                      </Button>
                      <Button onClick={() => {
                        setReplyingTo(null);
                        replyForm.resetFields();
                      }}>
                        取消
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <div className="comments-container">
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="content" rules={[{ required: true, message: '请输入评论内容' }]}>
          <TextArea rows={4} placeholder="写下你的评论..." />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" loading={submitting}>
            发表评论
          </Button>
        </Form.Item>
      </Form>

      <List
        className="comment-list"
        header={`${comments.length} 条评论`}
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={comment => (
          <div>
            {renderComment(comment)}
            {comment.replies && comment.replies.length > 0 && (
              <List
                className="reply-list"
                dataSource={getAllReplies(comment)}
                renderItem={reply => renderComment(reply, true)}
              />
            )}
          </div>
        )}
      />
    </div>
  );
};

export default Comments; 