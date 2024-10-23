import { Avatar, Divider } from "antd";
import React from "react";
import "./index.css"
import { GithubOutlined, QqOutlined, WechatOutlined } from "@ant-design/icons";

const Author = () => {
    return (
        <div className="author-div comm-box">
            <div>
                <Avatar size={100} src="https://static-qiniu.lanqiao.cn/avatar/uid3443051-20240402-1712025641448?imageView2/1/w/200/h/200" />
            </div>
            <div className="author-introduction">
                专注于灌水
                <Divider style={{ border: "1px" }}>社交账号</Divider>
                <Avatar size={28} icon={<GithubOutlined />} className="account" />
                <Avatar size={28} icon={<QqOutlined />} className="account" />
                <Avatar size={28} icon={<WechatOutlined />} className="account" />
            </div>
        </div>
    )
}

export default Author;