import React from 'react';
import { Col, List, Row } from 'antd';
import { CalendarOutlined, FireOutlined, BarsOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Advert from './Advert/Advert';
import LatestArticles from './LatestArticles';

const Home = () => {
  const [list] = React.useState([{
    id: 1,
    title: "灌水第一篇文章",
    context: "此组件于2024-10-22创建",
    date: "2024-10-22",
    category: "视频教学",
    views: 1234
  },
  {
    id: 1,
    title: "灌水第一篇文章",
    context: "此组件于2024-10-22创建",
    date: "2024-10-22",
    category: "视频教学",
    views: 1234
  }]);

  return (
    <>
      <Row className='comm-main' justify={"center"}>
        <Col className='comm-left' xs={24} sm={24} md={17} lg={19} xl={15}>
          <List
            header={<div style={{ padding: "0 0.5rem" }}>推荐文章</div>}
            itemLayout={"vertical"}
            dataSource={list}
            renderItem={(item) => {
              return <List.Item key={item.id}>
                <Link to={`/detail/${item.id}`}>
                  <div className='list-title'>{item.title}</div>
                  <div className='list-icons'>
                    <span className='list-icon'><CalendarOutlined /> {item.date} </span>
                    <span className='list-icon'><BarsOutlined /> {item.category} </span>
                    <span className='list-icon'><FireOutlined /> {item.views} </span>
                  </div>
                  <div className='list-context'>{item.context}</div>
                </Link>
              </List.Item>
            }} />
        </Col>
        <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={5}>
          <LatestArticles />
          <Advert />
        </Col>
      </Row>
    </>
  );
};

export default Home; 