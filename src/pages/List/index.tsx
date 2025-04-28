import React from 'react';
import { Col, List, Row, Breadcrumb } from 'antd';
import { CalendarOutlined, FireOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import Author from '../Home/Author/Author';
import Advert from '../Home/Advert/Advert';

const Page = () => {
    const location = useLocation();
    const [list] = React.useState([{
        title: "灌水第一篇文章",
        context: "此组件于2024-10-22创建"
    }]);

    const breadList = [
        {
            title: "首页",
            path: "/"
        },
        {
            title: "列表",
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
                        header={<div>最新日志</div>}
                        itemLayout={"vertical"}
                        dataSource={list}
                        renderItem={(item) => {
                            return <List.Item key={item.title}>
                                <div className='list-title'>{item.title}</div>
                                <div className='list-icons'>
                                    <span className='list-icon'><CalendarOutlined /> 2024-10-22 </span>
                                    <span className='list-icon'><FolderOpenOutlined /> 视频教学 </span>
                                    <span className='list-icon'><FireOutlined /> 1234人 </span>
                                </div>
                                <div className='list-context'>{item.context}</div>
                            </List.Item>
                        }} />
                </Col>
                <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={4}>
                    <Author />
                    <Advert />
                </Col>
            </Row>
        </>
    );
};

export default Page; 