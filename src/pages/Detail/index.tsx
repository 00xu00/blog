import React from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row } from 'antd';

const Detail = () => {
  const { id } = useParams();

  return (
    <div className="App">
      <title>List</title>
      <Row className='comm-main' justify={"center"}>
        <Col className='comm-left' xs={24} sm={24} md={16} lg={18} xl={14}>
          {id}
        </Col>
        <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={4}>
          右侧
        </Col>
      </Row>
    </div>
  );
};

export default Detail; 