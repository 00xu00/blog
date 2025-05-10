import React from 'react';
import { List, Typography, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { CalendarOutlined, FireOutlined } from '@ant-design/icons';
import type { Blog } from '@/types/blog';
import './index.css';

const { Title } = Typography;

interface LatestArticlesProps {
  latestBlogs: Blog[];
  loading: boolean;
}

const LatestArticles: React.FC<LatestArticlesProps> = ({ latestBlogs, loading }) => {
  return (
    <div className="latest-articles">
      <Title level={4} className="latest-title">最新文章</Title>
      <List
        loading={loading}
        dataSource={latestBlogs}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无最新文章"
            />
          )
        }}
        renderItem={(item) => (
          <List.Item key={item.id} className="latest-item">
            <Link to={`/detail/${item.id}`}>
              <div className="latest-content">
                <div className="latest-title">{item.title}</div>
                {item.subtitle && (
                  <div className="latest-subtitle">{item.subtitle}</div>
                )}
                <div className="latest-info">
                  <span className="latest-date">
                    <CalendarOutlined /> {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <span className="latest-views">
                    <FireOutlined /> {item.views_count}
                  </span>
                </div>
              </div>
            </Link>
          </List.Item>
        )}
      />
    </div>
  );
};

export default LatestArticles; 