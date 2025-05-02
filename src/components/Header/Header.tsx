import React, { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Row, Col, Menu, Input, Dropdown, Avatar, Badge, Switch, Drawer, Button, MenuProps, Space } from "antd"
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { markAsRead, Message } from '../../store/messageSlice';
import { useTheme } from '../../contexts/ThemeContext';
import {
    HomeOutlined,
    PlayCircleOutlined,
    SmileOutlined,
    SearchOutlined,
    UserOutlined,
    DownOutlined,
    BookOutlined,
    MenuOutlined,
    MoonOutlined,
    SunOutlined,
    MailOutlined,
    RobotOutlined,
} from "@ant-design/icons";
import "./header.css"

const { Search } = Input;

const Header = () => {
    const [current, setCurrent] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [indicatorStyle, setIndicatorStyle] = useState({ width: '0px', left: '0px' });
    const menuRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const { messages, unreadCount } = useSelector((state: RootState) => state.message);
    const { isDarkMode, toggleTheme } = useTheme();

    const menuItems: MenuProps['items'] = [
        {
            label: <Link to="/">首页</Link>,
            key: "home",
            icon: <HomeOutlined />
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

    const navigate = useNavigate();
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
            icon: <UserOutlined />,
            label: <Link to='/auth'>退出登录</Link>,
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
    }, []);

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

    return (
        <>
            <div className={`header ${isDarkMode ? 'dark' : 'light'}`}>
                <Row justify="space-between" align="middle" className="header-container">
                    <Col xs={4} sm={4} md={3} lg={2} xl={2}>
                        <div className="header-logo-container">
                            <span className="header-logo">曦景</span>
                            <span className="header-text">博客</span>
                        </div>
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
                                    <Avatar icon={<UserOutlined />} />
                                    <span className="">曦景</span>
                                    <DownOutlined className="header-user-arrow" />
                                </div>
                            </Dropdown>
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
    )
}

export default Header;
