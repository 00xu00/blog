import React, { useState, useEffect, useRef } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Row, Col, Menu, Input, Dropdown, Avatar, Badge, Switch, Drawer, Button, MenuProps, Space, message } from "antd"
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { markAsRead, Message } from '../../store/messageSlice';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../Logo/Logo';
import {
    HomeOutlined,
    SearchOutlined,
    UserOutlined,
    DownOutlined,
    BookOutlined,
    MenuOutlined,
    MoonOutlined,
    SunOutlined,
    MailOutlined,
    RobotOutlined,
    AppstoreOutlined,
    LogoutOutlined,
    LoginOutlined,
} from "@ant-design/icons";
import "./header.css"

const { Search } = Input;

interface UserInfo {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    created_at: string;
}

const Header = () => {
    const location = useLocation();
    const [current, setCurrent] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [indicatorStyle, setIndicatorStyle] = useState({ width: '0px', left: '0px' });
    const menuRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const { messages, unreadCount } = useSelector((state: RootState) => state.message);
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // 检查登录状态和获取用户信息
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserInfo = localStorage.getItem('userInfo');

        if (token && storedUserInfo) {
            try {
                const parsedUserInfo = JSON.parse(storedUserInfo) as UserInfo;
                setUserInfo(parsedUserInfo);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('解析用户信息失败:', error);
                handleLogout();
            }
        } else {
            setIsLoggedIn(false);
            setUserInfo(null);
        }
    }, []);

    // 根据路由路径获取对应的菜单key
    const getMenuKeyFromPath = (path: string) => {
        if (path === '/') return 'home';
        if (path.startsWith('/list')) return 'list';
        if (path.startsWith('/editor')) return 'write';
        if (path.startsWith('/ai-helper')) return 'ai-helper';
        return 'home';
    };

    // 监听路由变化，更新菜单选中状态
    useEffect(() => {
        const menuKey = getMenuKeyFromPath(location.pathname);
        setCurrent(menuKey);
    }, [location.pathname]);

    const menuItems: MenuProps['items'] = [
        {
            label: <Link to="/">首页</Link>,
            key: "home",
            icon: <HomeOutlined />
        },
        {
            label: <Link to="/list">文章列表</Link>,
            key: "list",
            icon: <AppstoreOutlined />
        },
        {
            label: <Link to="/editor">写文章</Link>,
            key: "write",
            icon: <BookOutlined />
        },
        {
            label: <Link to="/ai-helper">AI助手</Link>,
            key: "ai-helper",
            icon: <RobotOutlined />
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUserInfo(null);
        setIsLoggedIn(false);
        message.success('已退出登录');
        navigate('/auth');
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人中心',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'theme',
            icon: isDarkMode ? <SunOutlined /> : <MoonOutlined />,
            label: (
                <div className="theme-switch">
                    <span>{isDarkMode ? '浅色模式' : '深色模式'}</span>
                    <Switch
                        checked={isDarkMode}
                        onChange={toggleTheme}
                        size="small"
                    />
                </div>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: handleLogout,
            danger: true,
        },
    ];

    const onSearch = (value: string) => {
        console.log('搜索:', value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const updateIndicator = (key: string) => {
        if (menuRef.current) {
            const menuItems = menuRef.current.querySelectorAll('.ant-menu-item');
            const activeIndex = Array.from(menuItems).findIndex(item =>
                item.classList.contains('ant-menu-item-selected')
            );

            if (activeIndex !== -1) {
                const activeItem = menuItems[activeIndex] as HTMLElement;
                const { offsetLeft, offsetWidth } = activeItem;
                setIndicatorStyle({
                    width: `${offsetWidth}px`,
                    left: `${offsetLeft}px`
                });
            }
        }
    };

    useEffect(() => {
        // 初始设置指示器位置
        const timer = setTimeout(() => {
            updateIndicator(current);
        }, 100);
        return () => clearTimeout(timer);
    }, [current]);

    const handleMenuClick = (e: { key: string }) => {
        setCurrent(e.key);
        // 等待菜单项更新后再更新指示器位置
        setTimeout(() => {
            updateIndicator(e.key);
        }, 0);
    };

    const handleMessageClick = (message: Message) => {
        if (!message.isRead) {
            dispatch(markAsRead(message.id));
        }
        // 跳转到聊天页面
        navigate(`/chat/${message.sender.id}`);
    };

    const messageItems = [
        {
            key: 'messages',
            label: '私信',
            icon: <MailOutlined />,
            count: unreadCount,
            children: messages.map(message => ({
                key: message.id,
                label: (
                    <div className="header-notification-item" onClick={() => handleMessageClick(message)}>
                        <Avatar src={message.sender.avatar} icon={<UserOutlined />} />
                        <div className="notification-content">
                            <div className="notification-title">
                                <span>{message.sender.name}</span>
                                {!message.isRead && <Badge status="processing" />}
                            </div>
                            <div className="notification-desc">{message.content}</div>
                            <div className="notification-time">{message.createTime}</div>
                        </div>
                    </div>
                )
            }))
        }
    ];

    const handleLogin = () => {
        navigate('/auth');
    };

    return (
        <>
            <div className={`header ${isDarkMode ? 'dark' : 'light'}`}>
                <Row justify="space-between" align="middle" className="header-container">
                    <Col xs={4} sm={4} md={3} lg={2} xl={2}>
                        <Logo
                            className="header-logo"
                            size="medium"
                            theme={isDarkMode ? "dark" : "light"}
                            onClick={() => navigate('/')}
                        />
                    </Col>

                    <Col xs={0} sm={0} md={10} lg={12} xl={12}>
                        <div className="header-nav" ref={menuRef}>
                            <Menu
                                mode="horizontal"
                                items={menuItems}
                                selectedKeys={[current]}
                                onClick={handleMenuClick}
                                className={isDarkMode ? 'dark-menu' : 'light-menu'}
                            />
                            <div className="menu-indicator" style={indicatorStyle} />
                        </div>
                    </Col>

                    <Col xs={20} sm={20} md={11} lg={10} xl={10}>
                        <div className="header-actions">
                            <Search
                                placeholder="搜索文章..."
                                onSearch={onSearch}
                                onChange={handleSearchChange}
                                value={searchValue}
                                className="header-search"
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                            {isLoggedIn ? (
                                <>
                                    <Space size="large">
                                        <Dropdown
                                            menu={{ items: messageItems }}
                                            placement="bottomRight"
                                            trigger={['click']}
                                            overlayClassName="header-notification-dropdown"
                                        >
                                            <Badge count={unreadCount} className="header-notification">
                                                <MailOutlined className="header-icon" />
                                            </Badge>
                                        </Dropdown>
                                    </Space>
                                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                        <div className="header-user">
                                            <Avatar
                                                src={userInfo?.avatar}
                                                icon={<UserOutlined />}
                                            />
                                            <span className="header-username">{userInfo?.username || '用户'}</span>
                                            <DownOutlined className="header-user-arrow" />
                                        </div>
                                    </Dropdown>
                                </>
                            ) : (
                                <Button
                                    type="primary"
                                    icon={<LoginOutlined />}
                                    onClick={handleLogin}
                                    className="header-login-button"
                                >
                                    登录
                                </Button>
                            )}
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                className="mobile-menu-button"
                                onClick={() => setIsMobileMenuOpen(true)}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="header-placeholder"></div>

            <Drawer
                title="导航菜单"
                placement="right"
                onClose={() => setIsMobileMenuOpen(false)}
                open={isMobileMenuOpen}
                className={isDarkMode ? 'dark-drawer' : 'light-drawer'}
            >
                <Menu
                    mode="vertical"
                    items={menuItems}
                    selectedKeys={[current]}
                    onClick={(e) => {
                        setCurrent(e.key);
                        setIsMobileMenuOpen(false);
                    }}
                />
            </Drawer>
        </>
    );
};

export default Header;