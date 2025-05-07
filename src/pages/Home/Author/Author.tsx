import React from 'react';
import { Avatar, Divider } from 'antd';
import './index.css';
import { GithubOutlined } from "@ant-design/icons";

interface AuthorProps {
    author: {
        username: string;
        avatar?: string;
        bio?: string;
        introduction?: string;
        social_links?: {
            github?: string;
            [key: string]: string | undefined;
        };
    };
}

const Author: React.FC<AuthorProps> = ({ author }) => {
    return (
        <div className="author-div comm-box">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="avatar-container">
                    <Avatar
                        className="avatar"
                        size={100}
                        src={author.avatar || "https://static-qiniu.lanqiao.cn/avatar/uid3443051-20240402-1712025641448?imageView2/1/w/200/h/200"}
                    />
                    <div className="avatar-overlay">{author.username}</div>
                </div>
            </div>
            <div className="author-introduction">
                {author.bio || '专注于灌水'}
                <Divider style={{ border: "1px" }}>社交账号</Divider>
                <div className="social-icons">
                    {author.social_links?.github ? (
                        <a href={author.social_links.github} target="_blank" rel="noopener noreferrer">
                            <Avatar size={28} icon={<GithubOutlined />} className="account" />
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Author;