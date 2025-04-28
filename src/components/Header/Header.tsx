import React, { useState, useEffect, useRef } from "react"
import { Row, Col, Menu, Input, Dropdown, Avatar, Badge, Switch, Drawer, Button, MenuProps } from "antd"
import {
    HomeOutlined,
    PlayCircleOutlined,
    SmileOutlined,
    SearchOutlined,
    BellOutlined,
    UserOutlined,
    DownOutlined,
    BookOutlined,
    MessageOutlined,
    SettingOutlined,
    MenuOutlined,
    MoonOutlined,
    SunOutlined
} from "@ant-design/icons";
import "./header.css"

const { Search } = Input;

const Header = () => {
    const [current, setCurrent] = useState('home');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [indicatorStyle, setIndicatorStyle] = useState({ width: '0px', left: '0px' });
    const menuRef = useRef<HTMLDivElement>(null);

    const menuItems: MenuProps['items'] = [
        {
            label: "首页",
            key: "home",
            icon: <HomeOutlined />
        },
        {
            label: "视频",
            key: "video",
            icon: <PlayCircleOutlined />
        },
        {
            label: "生活",
            key: "life",
            icon: <SmileOutlined />
        },
        {
            label: "文章",
            key: "article",
            icon: <BookOutlined />
        }
    ];

    const toggleDarkMode = (checked: boolean) => {
        setIsDarkMode(checked);
        if (checked) {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.documentElement.classList.add('light-mode');
        }
    };

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);
        if (savedDarkMode) {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.documentElement.classList.add('light-mode');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人中心',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '设置',
        },
        {
            key: 'theme',
            icon: isDarkMode ? <SunOutlined /> : <MoonOutlined />,
            label: (
                <div className="theme-switch">
                    <span>{isDarkMode ? '浅色模式' : '深色模式'}</span>
                    <Switch
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
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
            label: '退出登录',
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
                            <Badge count={5} className="header-notification">
                                <BellOutlined />
                            </Badge>
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