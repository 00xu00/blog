import React from 'react';
import { List } from 'antd';
import { Link } from 'react-router-dom';
import { Blog } from '../../../types/blog';

interface LatestArticlesProps {
  latestBlogs: Blog[];
  loading: boolean;
}

const LatestArticles: React.FC<LatestArticlesProps> = ({ latestBlogs, loading }) => {
  return (
    <List
      header={<div style={{ padding: "0 0.5rem" }}>最新日志</div>}
      itemLayout="vertical"
      dataSource={latestBlogs}
      loading={loading}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <Link to={`/detail/${item.id}`}>
            <div className="list-title">{item.title}</div>
            <div className="list-context">{item.subtitle}</div>
          </Link>
        </List.Item>
      )}
    />
  );
};

export default LatestArticles; 