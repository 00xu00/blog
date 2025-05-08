import React, { useState, useEffect } from 'react';
import { Form, Button, List, Input, message, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getBlogComments, createComment } from '../../api/comment';
import { formatDate } from '../../utils/date';
import './index.css';

const { TextArea } = Input;

interface CommentsProps {
  blogId: number;
  onCommentCountChange?: (count: number) => void;
}

const Comments: React.FC<CommentsProps> = ({ blogId, onCommentCountChange }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

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
        content: values.content
      });
      message.success('评论成功');
      form.resetFields();
      fetchComments();
    } catch (error) {
      message.error('评论失败');
    } finally {
      setSubmitting(false);
    }
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
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={item.author.avatar}
                  icon={!item.author.avatar && <UserOutlined />}
                  alt={item.author.username}
                  className="comment-avatar"
                />
              }
              title={
                <div>
                  <span className="comment-author">{item.author.username}</span>
                  <span className="comment-time" style={{ marginLeft: '10px' }}>{formatDate(item.created_at)}</span>
                </div>
              }
              description={item.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Comments; 