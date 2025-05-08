import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBlog, deleteBlog } from '../../api/blog';
import { likeBlog, unlikeBlog, favoriteBlog, unfavoriteBlog } from '../../api/interaction';
import InteractionButtons from '../../components/InteractionButtons';
import './index.css';

const { Title, Paragraph } = Typography;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // 使用useRef来跟踪是否已经发送过请求
  const requestSent = React.useRef(false);

  useEffect(() => {
    // 确保只发送一次请求
    if (!requestSent.current) {
      requestSent.current = true;
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await getBlog(id);
      setBlog(response.data);
    } catch (error) {
      message.error('获取博客详情失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteBlog(id);
      message.success('删除成功');
      navigate('/');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleLike = async (blogId) => {
    try {
      const response = await likeBlog(blogId);
      setBlog(response.data);
      message.success('点赞成功');
    } catch (error) {
      message.error('点赞失败');
    }
  };

  const handleUnlike = async (blogId) => {
    try {
      const response = await unlikeBlog(blogId);
      setBlog(response.data);
      message.success('取消点赞成功');
    } catch (error) {
      message.error('取消点赞失败');
    }
  };

  const handleFavorite = async (blogId) => {
    try {
      const response = await favoriteBlog(blogId);
      setBlog(response.data);
      message.success('收藏成功');
    } catch (error) {
      message.error('收藏失败');
    }
  };

  const handleUnfavorite = async (blogId) => {
    try {
      const response = await unfavoriteBlog(blogId);
      setBlog(response.data);
      message.success('取消收藏成功');
    } catch (error) {
      message.error('取消收藏失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!blog) {
    return <div>博客不存在</div>;
  }

  return (
    <div className="blog-detail">
      <Card>
        <div className="blog-header">
          <Title level={2}>{blog.title}</Title>
          <div className="blog-actions">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              编辑
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </div>
        </div>
        <InteractionButtons
          blog={blog}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onFavorite={handleFavorite}
          onUnfavorite={handleUnfavorite}
        />
        <Paragraph>{blog.content}</Paragraph>
      </Card>
    </div>
  );
};

export default BlogDetail; 