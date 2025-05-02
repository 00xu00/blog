import React from 'react';
import { Row, Col } from 'antd';
import AIHelper from '../../components/AIHelper/AIHelper';
import Author from '../Home/Author/Author';
import Advert from '../Home/Advert/Advert';

const Page = () => {
  return (
    <Row className='comm-main' justify={"center"}>
      <Col className='comm-left' xs={24} sm={24} md={16} lg={18} xl={14}>
        <AIHelper />
      </Col>
      <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={4}>
        <Author />
        <Advert />
      </Col>
    </Row>
  );
};

export default Page; 