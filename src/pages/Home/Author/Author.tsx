import { Avatar, Divider } from "antd";
import React from "react";
import "./index.css"
import { GithubOutlined } from "@ant-design/icons";

const Author = () => {
    return (
        <div className="author-div comm-box">
            <div style={{ display: 'felx' }}>
                <div className="avatar-container">
                    <Avatar className="avatar" size={100} src="https://static-qiniu.lanqiao.cn/avatar/uid3443051-20240402-1712025641448?imageView2/1/w/200/h/200" />
                    <div className="avatar-overlay">Xijing</div>
                </div>
            </div>
            <div className="author-introduction">
                专注于灌水
                <Divider style={{ border: "1px" }}>社交账号</Divider>
                <a href="http://www.baidu.com"><Avatar size={28} icon={<GithubOutlined />} className="account" /></a>
            </div>
        </div>
    )
}

export default Author;