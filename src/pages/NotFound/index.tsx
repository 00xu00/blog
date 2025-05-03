import React, { useEffect, useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, RollbackOutlined, SmileOutlined } from '@ant-design/icons';
import './index.css';

const { Title, Text } = Typography;

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`not-found-container ${isVisible ? 'visible' : ''}`}
      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
    >
      <div className="not-found-content">
        <div className="error-code">
          <span className="number">4</span>
          <span className="number">0</span>
          <span className="number">4</span>
        </div>
        <Title level={2} className="not-found-title">
          哎呀！页面走丢了
        </Title>
        <Text type="secondary" className="not-found-description">
          看起来你要找的页面不存在或者已经被移除了
        </Text>
        <Space size="large" className="not-found-actions">
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            className="action-button"
          >
            返回首页
          </Button>
          <Button
            icon={<RollbackOutlined />}
            onClick={() => navigate(-1)}
            className="action-button"
          >
            返回上一页
          </Button>
        </Space>
        <div className="not-found-footer">
          <SmileOutlined className="smile-icon" />
          <Text type="secondary">别担心，我们还有很多精彩内容等着你</Text>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 