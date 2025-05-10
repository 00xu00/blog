import React, { useState, useEffect } from 'react';
import { Avatar, Divider, Button, message } from 'antd';
import './index.css';
import { GithubOutlined, UserAddOutlined, CheckOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { followUser, unfollowUser, checkFollowingStatus } from '../../../api/user';

interface AuthorProps {
    author: {
        id: number;
        username: string;
        avatar?: string;
        bio?: string;
        introduction?: string;
        social_links?: {
            github?: string;
            [key: string]: string | undefined;
        };
    };
    onAuthorClick?: (author: AuthorProps['author']) => void;
    isCurrentUser?: boolean;
    isFollowing?: boolean;
}

const Author: React.FC<AuthorProps> = ({ author, onAuthorClick, isCurrentUser = false, isFollowing: isFollowingProp }) => {
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(!!isFollowingProp);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsFollowing(!!isFollowingProp);
    }, [isFollowingProp]);

    const handleAvatarClick = () => {
        if (onAuthorClick) {
            onAuthorClick(author);
        }
    };

    const handleFollow = async () => {
        try {
            setIsLoading(true);
            if (isFollowing) {
                await unfollowUser(author.id);
                message.success('取消关注成功');
            } else {
                await followUser(author.id);
                message.success('关注成功');
            }
            setIsFollowing(!isFollowing);
        } catch (error: any) {
            message.error(error.response?.data?.detail || '操作失败');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="author-div comm-box">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="avatar-container" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
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
                {!isCurrentUser && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <Button
                            type={isFollowing ? 'default' : 'primary'}
                            icon={isFollowing ? <CheckOutlined /> : <UserAddOutlined />}
                            onClick={handleFollow}
                            loading={isLoading}
                            block
                        >
                            {isFollowing ? '已关注' : '关注'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Author;