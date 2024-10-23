import React, { useState } from 'react';
import "./index.css"
import Header from "./components/Header/Header"
import { Col, List, Row } from 'antd';
import { CalendarOutlined, FireOutlined, FolderOpenOutlined } from '@ant-design/icons';
import Author from './pages/Author/Author';

function App() {

  const [list, SetList] = useState([{
    title: "灌水第一篇文章",
    context: "此组件于2024-10-22创建"
  },
  {
    title: "曦景发牢骚篇",
    context: "2024-10-23 23:00 她又和那个温柔玩,她说过几天删好友不知道是不是真的,感觉我和她感情淡了很多,我都不知道干什么了,只好晚上学习,加强技能,如果继续这么下去..."
  }
  ]);

  return (
    <div className="App">
      <title>首页</title>
      <Header />
      <Row className='comm-main' justify={"center"}>
        <Col className='comm-left' xs={24} sm={24} md={16} lg={18} xl={14}>
          <List header={<div>最新日志</div>} itemLayout={"vertical"} dataSource={list} renderItem={(item) => {
            return <List.Item key={item.title}>
              <div className='list-title'>{item.title}</div>
              <div className='list-icon'>
                <span><CalendarOutlined /> 2024-10-22 </span>
                <span><FolderOpenOutlined /> 视频教学 </span>
                <span><FireOutlined /> 1234人 </span>
              </div>
              <div className='list-context'>{item.context}</div>
            </List.Item>
          }} />
        </Col>
        <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={4}>
          <Author />
        </Col>
      </Row>
    </div>
  );
}

export default App;
