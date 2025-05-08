import React from 'react';
import { List } from 'antd';
import { Link } from 'react-router-dom';
import { CalendarOutlined, FireOutlined, BarsOutlined } from '@ant-design/icons';
import "./index.css"

const LatestArticles = () => {
  const latestList = [
    {
      id: 1,
      title: 'React 入门教程',
      date: '2024-10-21',
      category: '前端开发',
      views: 1234
    },
    {
      id: 2,
      title: 'TypeScript 最佳实践',
      date: '2024-10-20',
      category: '前端开发',
      views: 2345
    },
    {
      id: 3,
      title: '前端性能优化指南',
      date: '2024-10-19',
      category: '前端开发',
      views: 3456
    }
  ];

  return (
    <div className="latest-box">
      <List
        header={<div>最新日志</div>}
        itemLayout="horizontal"
        dataSource={latestList}
        renderItem={(item) => (
          <List.Item>
            <Link to={`/detail/${item.id}`}>
              <div className="latest-item">
                <div className="latest-title">{item.title}</div>
                <div className="latest-info">
                  <span className="latest-icon"><CalendarOutlined /> {item.date}</span>
                  <span className="latest-icon"><BarsOutlined /> {item.category}</span>
                  <span className="latest-icon"><FireOutlined /> {item.views}</span>
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