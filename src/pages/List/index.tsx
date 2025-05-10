import React, { useEffect, useState } from 'react';
import { Col, List, Row, Breadcrumb, Empty, Typography } from 'antd';
import { CalendarOutlined, FireOutlined, BarsOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { getLatestBlogs } from '../../api/blog';
import type { Blog } from '@/types/blog';
import './index.css';

const { Title } = Typography;

const Page = () => {
    const location = useLocation();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    // 获取文章列表
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await getLatestBlogs();
                setBlogs(response || []);
            } catch (error) {
                console.error('获取文章列表失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const breadList = [
        {
            title: "首页",
            path: "/"
        },
        {
            title: "文章列表",
            path: "/list"
        }
    ];

    return (
        <>
            <Row className='comm-main' justify={"center"}>
                <Col className='comm-left' xs={24} sm={24} md={16} lg={18} xl={14}>
                    <div className='bread-div'>
                        <Breadcrumb
                            items={breadList.map(item => ({
                                title: <Link to={item.path}>{item.title}</Link>,
                                className: location.pathname === item.path ? 'active' : ''
                            }))}
                        />
                    </div>
                    <List
                        loading={loading}
                        header={<Title style={{ marginTop: '10px' }} level={4}>最新文章</Title>}
                        itemLayout={"vertical"}
                        dataSource={blogs}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="暂无文章"
                                />
                            )
                        }}
                        renderItem={(item) => (
                            <List.Item key={item.id} className='list-item'>
                                <Link to={`/detail/${item.id}`}>
                                    <div className='list-title'>{item.title}</div>
                                    {item.subtitle && (
                                        <div className='list-subtitle'>{item.subtitle}</div>
                                    )}
                                    <div className='list-icons'>
                                        <span className='list-icon'>
                                            <CalendarOutlined /> {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                        {item.tags && item.tags.length > 0 && (
                                            <span className='list-icon'>
                                                <BarsOutlined /> {item.tags.join(', ')}
                                            </span>
                                        )}
                                        <span className='list-icon'>
                                            <FireOutlined /> {item.views_count}
                                        </span>
                                    </div>
                                </Link>
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
        </>
    );
};

export default Page; 