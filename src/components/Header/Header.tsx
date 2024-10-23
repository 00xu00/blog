import React from "react"
import { Row, Col, Menu } from "antd"
import { HomeOutlined, PlayCircleOutlined, SmileOutlined } from "@ant-design/icons";
import "./header.css"

const page = () => {
    const Items = [
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
    ]


    return (
        <div className="header">
            <Row justify={"center"} align={"middle"}>

                <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                    <span className="header-logo">曦景</span>
                    <span className="header-text">这是曦景用来灌水的个人博客</span>
                </Col>
                <Col xs={0} sm={0} md={14} lg={8} xl={6}>
                    <Menu mode="horizontal" items={Items}>
                    </Menu>
                </Col>
            </Row>
        </div>
    )
}

export default page;