import React, { useEffect, useState } from 'react';
import { Col, List, Row, message } from 'antd';
import { CalendarOutlined, FireOutlined, BarsOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Advert from './Advert/Advert';
import LatestArticles from './LatestArticles';
import { getRecommendedBlogs, getLatestBlogs } from '../../api/blog';
import type { Blog } from '@/types/blog';

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
            header={<div style={{ padding: "0 0.5rem" }}>推荐文章</div>}
            itemLayout={"vertical"}
            dataSource={recommendedBlogs}
            loading={loading}
            renderItem={(item) => {
              return <List.Item key={item.id}>
                <Link to={`/detail/${item.id}`}>
                  <div className='list-title'>{item.title}</div>
                  <div className='list-icons'>
                    <span className='list-icon'><CalendarOutlined /> {new Date(item.created_at).toLocaleDateString()} </span>
                    <span className='list-icon'><BarsOutlined /> {item.tags?.join(', ')} </span>
                    <span className='list-icon'><FireOutlined /> {item.views_count} </span>
                  </div>
                  <div className='list-context'>{item.subtitle}</div>
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