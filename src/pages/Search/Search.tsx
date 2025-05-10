import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, Avatar, Space, Tag, Empty } from 'antd';
import { UserOutlined, EyeOutlined, LikeOutlined, StarOutlined } from '@ant-design/icons';
import { SearchResult } from '../../api/search';
import './Search.css';

const { Title, Text } = Typography;

const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, keyword } = location.state as { results: SearchResult[], keyword: string };

  const handleBlogClick = (blogId: number) => {
    navigate(`/detail/${blogId}`);
  };

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement> | undefined, authorId: number) => {
    if (e) {
      e.stopPropagation();
    }
    navigate(`/profile/${authorId}`);
  };

  if (!results || results.length === 0) {
    return (
      <div className="search-page">
        <Empty
          description={
            <span>
              没有找到与 "<Text strong>{keyword}</Text>" 相关的文章
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="search-page">
      <Title level={2}>
        搜索结果: <Text type="secondary">{keyword}</Text>
      </Title>
      <div className="search-results">
        {results.map((blog) => (
          <Card
            key={blog.id}
            className="search-result-card"
            hoverable
            onClick={() => handleBlogClick(blog.id)}
          >
            <div className="blog-header">
              <Space>
                <Avatar
                  src={blog.author.avatar}
                  icon={<UserOutlined />}
                  onClick={(e) => handleAvatarClick(e, blog.author.id)}
                />
                <Text strong>{blog.author.username}</Text>
              </Space>
              <Text type="secondary">
                {new Date(blog.created_at).toLocaleDateString()}
              </Text>
            </div>
            <Title level={4} className="blog-title">
              {blog.title}
            </Title>
            {blog.subtitle && (
              <Text type="secondary" className="blog-subtitle">
                {blog.subtitle}
              </Text>
            )}
            <div className="blog-footer">
              <Space>
                <Tag icon={<EyeOutlined />} color="blue">
                  {blog.views_count}
                </Tag>
                <Tag icon={<LikeOutlined />} color="red">
                  {blog.likes_count}
                </Tag>
                <Tag icon={<StarOutlined />} color="gold">
                  {blog.favorites_count}
                </Tag>
              </Space>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Search; 