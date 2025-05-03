import React from 'react';
import { Row, Col } from 'antd';
import AIHelper from '../../components/AIHelper/AIHelper';

const Page = () => {
  return (
    <Row className='comm-main' justify={"center"}>
      <Col className='comm-left' xs={24} sm={24} md={16} lg={18} xl={14}>
        <AIHelper />
      </Col>
    </Row>
  );
};

export default Page; 