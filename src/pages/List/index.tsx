import React, { useEffect, useState } from 'react';
import { Col, List, Row, Breadcrumb, Empty, Typography, Pagination } from 'antd';
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
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    // 获取文章列表
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await getLatestBlogs(currentPage, pageSize);
                console.log('获取到的博客数据:', response);
                if (response && response.data) {
                    setBlogs(response.data);
                    setTotal(response.total);
                } else {
                    setBlogs([]);
                    setTotal(0);
                }
            } catch (error) {
                console.error('获取文章列表失败:', error);
                setBlogs([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

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

    console.log('当前渲染的博客列表:', blogs); // 添加渲染时的日志

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
                                            <FireOutlined /> {item.views_count || 0}
                                        </span>
                                    </div>
                                </Link>
                            </List.Item>
                        )}
                        footer={
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={total}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                />
                            </div>
                        }
                    />
                </Col>
            </Row>
        </>
    );
};

export default Page; 