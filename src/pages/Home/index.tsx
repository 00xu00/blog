import React, { useEffect, useState } from 'react';
import { Col, List, Row, message, Empty, Typography } from 'antd';
import { CalendarOutlined, FireOutlined, BarsOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Advert from './Advert/Advert';
import LatestArticles from './LatestArticles';
import { getRecommendedBlogs, getLatestBlogs } from '../../api/blog';
import type { Blog } from '@/types/blog';
import './index.css';

const { Title } = Typography;

const Home = () => {
  const [recommendedBlogs, setRecommendedBlogs] = useState<Blog[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const [recommendedData, latestData] = await Promise.all([
          getRecommendedBlogs(),
          getLatestBlogs()
        ]);
        setRecommendedBlogs(recommendedData);
        setLatestBlogs(latestData);
      } catch (error) {
        console.error('获取博客列表失败:', error);
        message.error('获取博客列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Row className='comm-main' justify={"center"}>
        <Col className='comm-left' xs={24} sm={24} md={17} lg={19} xl={15}>
          <List
            header={<Title level={4} style={{ margin: '6px 0' }}>推荐文章</Title>}
            itemLayout={"vertical"}
            dataSource={recommendedBlogs}
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无推荐文章"
                />
              )
            }}
            renderItem={(item) => {
              return <List.Item key={item.id} className="blog-list-item">
                <Link to={`/detail/${item.id}`}>
                  <div className='list-title'>{item.title}</div>
                  <div className='list-context'>{item.subtitle}</div>
                  <div className='list-icons'>
                    <span className='list-icon'><CalendarOutlined /> {new Date(item.created_at).toLocaleDateString()} </span>
                    <span className='list-icon'><BarsOutlined /> {item.tags?.join(', ') || '无标签'} </span>
                    <span className='list-icon'><FireOutlined /> {item.views_count}</span>
                  </div>
                </Link>
              </List.Item>
            }} />
        </Col>
        <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={5}>
          <LatestArticles latestBlogs={latestBlogs} loading={loading} />
          <Advert />
        </Col>
      </Row>
    </>
  );
};

export default Home; 