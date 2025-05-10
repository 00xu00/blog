import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Badge } from 'antd';
import { UserOutlined, MailOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getUnreadCount } from '../../api/message';
import './index.css';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
      // 每30秒更新一次未读消息数量
      const timer = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(timer);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人中心</Link>
      </Menu.Item>
      <Menu.Item key="messages" icon={<MailOutlined />}>
        <Link to="/profile?tab=messages">
          私信
          {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 8 }} />}
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="header">
      <div className="logo">
        <Link to="/">曦景博客</Link>
      </div>
      <Menu theme="dark" mode="horizontal" className="menu">
        <Menu.Item key="home">
          <Link to="/">首页</Link>
        </Menu.Item>
        <Menu.Item key="list">
          <Link to="/list">文章列表</Link>
        </Menu.Item>
      </Menu>
      <div className="user-info">
        {isLoggedIn ? (
          <Menu mode="horizontal" theme="dark" className="user-menu">
            <Menu.SubMenu
              key="user"
              icon={<Avatar icon={<UserOutlined />} />}
              title="用户中心"
            >
              {userMenu}
            </Menu.SubMenu>
          </Menu>
        ) : (
          <Button type="primary" onClick={() => navigate('/auth')}>
            登录/注册
          </Button>
        )}
      </div>
    </AntHeader>
  );
};

export default Header; 