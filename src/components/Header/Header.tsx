import React, { useState, useEffect, useRef } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Row, Col, Menu, Input, Dropdown, Avatar, Badge, Switch, Drawer, Button, MenuProps, Space, message as antMessage } from "antd"
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
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
    ExperimentOutlined,
} from "@ant-design/icons";
import "./header.css"
import { getMessages, markMessageAsRead } from '../../api/message';
import { getSearchHistory, searchBlogs, SearchHistory, SearchResult } from '../../api/search';

const { Search } = Input;

interface UserInfo {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    followers_count: number;
    following_count: number;
    articles_count: number;
}

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    is_read: boolean;
    created_at: string;
    sender: {
        id: number;
        username: string;
        avatar: string | null;
    };
    receiver: {
        id: number;
        username: string;
        avatar: string | null;
    };
}

const Header = () => {
    const location = useLocation();
    const [current, setCurrent] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [indicatorStyle, setIndicatorStyle] = useState({ width: '0px', left: '0px' });
    const menuRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const [localUnreadCount, setLocalUnreadCount] = useState(0);
    const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // 获取用户真实数据
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoggedIn(false);
                    setUserInfo(null);
                    setIsLoading(false);
                    return;
                }

                let retryCount = 0;
                const maxRetries = 3;
                let lastError = null;

                while (retryCount < maxRetries) {
                    try {
                        const response = await fetch('http://localhost:8000/api/v1/users/me', {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token.trim()}`,
                                'Content-Type': 'application/json',
                            },
                        });

                        if (response.ok) {
                            const data = await response.json();
                            setUserInfo(data);
                            setIsLoggedIn(true);
                            setIsLoading(false);
                            return;
                        } else if (response.status === 401) {
                            console.error('Token 验证失败:', token);
                            localStorage.removeItem('token');
                            setIsLoggedIn(false);
                            setUserInfo(null);
                            navigate('/auth');
                            return;
                        } else {
                            const errorData = await response.json().catch(() => ({}));
                            lastError = errorData.detail || '获取用户信息失败';

                            if (retryCount < maxRetries - 1) {
                                retryCount++;
                                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                                continue;
                            }
                        }
                    } catch (error) {
                        lastError = '请求出错';
                        if (retryCount < maxRetries - 1) {
                            retryCount++;
                            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                            continue;
                        }
                    }
                }

                if (lastError) {
                    antMessage.error(lastError);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('获取用户信息出错:', error);
                antMessage.error('获取用户信息失败，请稍后重试');
                setIsLoading(false);
            }
        };

        fetchUserInfo();
    }, [navigate]);

    // 加载消息列表
    const loadMessages = async () => {
        if (!userInfo) return;

        try {
            const response = await getMessages();
            if (!response || !Array.isArray(response)) {
                console.error('获取消息失败：返回数据格式不正确');
                setLocalMessages([]);
                return;
            }

            // 按用户分组，只保留每个用户的最新消息
            const userMessages = response.reduce((acc: Record<string, Message>, msg: Message) => {
                if (!msg || !msg.sender || !msg.receiver) {
                    console.log('跳过无效消息:', msg);
                    return acc;
                }

                const otherUserId = msg.sender_id === Number(userInfo.id) ? msg.receiver_id : msg.sender_id;

                if (!acc[otherUserId] || new Date(msg.created_at) > new Date(acc[otherUserId].created_at)) {
                    acc[otherUserId] = msg;
                }
                return acc;
            }, {});

            const sortedMessages = Object.values(userMessages).sort((a, b) =>
                new Date((b as Message).created_at).getTime() - new Date((a as Message).created_at).getTime()
            ) as Message[];

            setLocalMessages(sortedMessages);

            // 计算未读消息数量
            const unread = response.filter((msg: Message) =>
                !msg.is_read && msg.receiver_id === Number(userInfo.id)
            ).length;
            setLocalUnreadCount(unread);
        } catch (error) {
            console.error('加载私信失败:', error);
            antMessage.error('加载私信失败');
            setLocalMessages([]);
        }
    };

    // 定期刷新消息
    useEffect(() => {
        if (userInfo) {
            loadMessages();
            const timer = setInterval(loadMessages, 30000); // 每30秒刷新一次
            return () => clearInterval(timer);
        }
    }, [userInfo]);

    // 处理消息点击
    const handleMessageClick = async (message: Message) => {
        try {
            // 如果是接收者且消息未读，则标记为已读
            if (message.receiver_id === Number(userInfo?.id) && !message.is_read) {
                await markMessageAsRead(message.id);
                // 更新消息状态
                setLocalMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === message.id ? { ...msg, is_read: true } : msg
                    )
                );
                // 更新未读计数
                setLocalUnreadCount(prev => Math.max(0, prev - 1));
            }

            // 确定聊天对象
            const chatUserId = message.sender_id === Number(userInfo?.id) ? message.receiver_id : message.sender_id;
            const chatUsername = message.sender_id === Number(userInfo?.id) ? message.receiver.username : message.sender.username;
            const chatUserAvatar = message.sender_id === Number(userInfo?.id) ? message.receiver.avatar : message.sender.avatar;

            // 跳转到聊天页面
            navigate('/chat', {
                state: {
                    userId: chatUserId,
                    username: chatUsername,
                    avatar: chatUserAvatar,
                    initialMessage: message.content,
                    timestamp: message.created_at
                }
            });
        } catch (error: any) {
            console.error('处理消息点击失败:', error);
            antMessage.error('操作失败，请稍后重试');
        }
    };

    // 根据路由路径获取对应的菜单key
    const getMenuKeyFromPath = (path: string) => {
        if (path === '/') return 'home';
        if (path.startsWith('/list')) return 'list';
        if (path.startsWith('/editor')) return 'write';
        if (path.startsWith('/ai-helper')) return 'ai-helper';
        if (path.startsWith('/flexbox-froggy')) return 'flexbox-froggy';
        return 'home';
    };

    // 监听路由变化，更新菜单选中状态
    useEffect(() => {
        const menuKey = getMenuKeyFromPath(location.pathname);
        setCurrent(menuKey);
        // 更新指示器位置
        setTimeout(() => {
            updateIndicator(menuKey);
        }, 100);
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
        },
        {
            label: <Link to="/flexbox-froggy">Flexbox游戏</Link>,
            key: "flexbox-froggy",
            icon: <ExperimentOutlined />
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserInfo(null);
        setIsLoggedIn(false);
        antMessage.success('已退出登录');
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

    // 加载搜索历史
    const loadSearchHistory = async () => {
        if (!isLoggedIn) return;

        try {
            console.log('开始加载搜索历史...');
            const history = await getSearchHistory();
            console.log('搜索历史加载成功:', history);
            setSearchHistory(history);
        } catch (error) {
            console.error('加载搜索历史失败:', error);
            antMessage.error('加载搜索历史失败');
        }
    };

    // 处理搜索框获得焦点
    const handleSearchFocus = () => {
        console.log('搜索框获得焦点');
        setIsSearchFocused(true);
        if (isLoggedIn) {
            console.log('用户已登录，加载搜索历史');
            loadSearchHistory();
        } else {
            console.log('用户未登录，不加载搜索历史');
        }
    };

    // 处理搜索框失去焦点
    const handleSearchBlur = () => {
        console.log('搜索框失去焦点');
        setTimeout(() => {
            setIsSearchFocused(false);
        }, 200);
    };

    // 处理搜索
    const onSearch = async (value: string) => {
        if (!value.trim()) return;

        try {
            const results = await searchBlogs(value);
            setSearchResults(results);
            navigate('/search', { state: { results, keyword: value } });
        } catch (error) {
            console.error('搜索失败:', error);
            antMessage.error('搜索失败，请稍后重试');
        }
    };

    // 处理搜索输入变化
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);

        // 清除之前的定时器
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // 设置新的定时器，延迟300ms执行搜索
        if (value.trim()) {
            searchTimeoutRef.current = setTimeout(() => {
                onSearch(value);
            }, 300);
        } else {
            setSearchResults([]);
        }
    };

    // 处理搜索历史点击
    const handleHistoryClick = (keyword: string) => {
        setSearchValue(keyword);
        onSearch(keyword);
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

    const messageItems = [
        {
            key: 'messages',
            label: '私信',
            icon: <MailOutlined />,
            count: localUnreadCount,
            children: localMessages.map(message => {
                const isUnread = message.receiver_id === Number(userInfo?.id) && !message.is_read;
                const isSent = message.sender_id === Number(userInfo?.id);
                const otherUser = isSent ? message.receiver : message.sender;

                return {
                    key: message.id,
                    label: (
                        <div
                            className={`header-notification-item ${isUnread ? 'unread' : ''}`}
                            onClick={() => handleMessageClick(message)}
                        >
                            <Avatar src={otherUser.avatar} icon={<UserOutlined />} />
                            <div className="notification-content">
                                <div className="notification-title">
                                    <span>{otherUser.username}</span>
                                    {isUnread && <Badge status="processing" />}
                                </div>
                                <div className="notification-desc">
                                    {isSent && <span className="message-sent-indicator">你：</span>}
                                    {message.content.length > 30
                                        ? `${message.content.substring(0, 30)}...`
                                        : message.content}
                                </div>
                                <div className="notification-time">
                                    {new Date(message.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )
                };
            })
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
                            <div className="search-container">
                                <Search
                                    placeholder="搜索文章..."
                                    onSearch={onSearch}
                                    onChange={handleSearchChange}
                                    value={searchValue}
                                    className="header-search"
                                    prefix={<SearchOutlined />}
                                    allowClear
                                    onFocus={handleSearchFocus}
                                    onBlur={handleSearchBlur}
                                />
                                {isSearchFocused && isLoggedIn && searchHistory.length > 0 && (
                                    <div className="search-history-dropdown">
                                        <div className="search-history-header">
                                            <span>搜索历史</span>
                                            <Button type="link" size="small" onClick={() => setSearchHistory([])}>
                                                清空历史
                                            </Button>
                                        </div>
                                        <div className="search-history-list">
                                            {searchHistory.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="search-history-item"
                                                    onClick={() => handleHistoryClick(item.keyword)}
                                                >
                                                    <SearchOutlined />
                                                    <span>{item.keyword}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {isLoggedIn ? (
                                <>
                                    <Space size="large">
                                        <Dropdown
                                            menu={{ items: messageItems }}
                                            placement="bottomRight"
                                            trigger={['click']}
                                            overlayClassName="header-notification-dropdown"
                                        >
                                            <Badge count={localUnreadCount} className="header-notification">
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