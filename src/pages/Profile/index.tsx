import React, { useEffect, useState } from 'react';
import { Tabs, List, Avatar, Space, Badge, Button, Card, Tag, message, Input, Modal, Upload } from 'antd';
import {
  MailOutlined,
  HistoryOutlined,
  LikeOutlined,
  StarOutlined,
  EditOutlined,
  UserOutlined,
  HeartOutlined,
  EyeOutlined,
  MessageOutlined,
  UserAddOutlined,
  CheckOutlined,
  UploadOutlined,
  CalendarOutlined,
  BarsOutlined,
  FireOutlined,
  SendOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import './index.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getUserInfo, getUserFollowing, getUserFollowers, followUser, unfollowUser, checkFollowingStatus } from '../../api/user';
import { getUserBlogs, getUserLikedBlogs, getUserFavoriteBlogs, likeBlog, unlikeBlog, favoriteBlog, unfavoriteBlog } from '../../api/blog';
import { formatDate } from '../../utils/date';
import { getMessages, getConversation, createMessage, markMessageAsRead } from '../../api/message';
import axios from 'axios';

const API_URL = "http://localhost:8000/api/v1";
const { TabPane } = Tabs;

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

interface Blog {
  id: number;
  title: string;
  description: string;
  created_at: string;
  views_count: number;
  likes: number;
  comments: number;
  is_liked?: boolean;
  is_favorited?: boolean;
  tags?: string[];
  subtitle?: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
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

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOtherUser = location.state?.isOtherUser;
  const otherUserId = location.state?.authorId;
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followerFollowingMap, setFollowerFollowingMap] = useState<Record<string, boolean>>({});
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('articles');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const data = await getUserInfo(isOtherUser ? Number(otherUserId) : undefined);
        setUserInfo(data);

        // 如果是其他用户的profile，检查关注状态
        if (isOtherUser && otherUserId) {
          const followingStatus = await checkFollowingStatus(Number(otherUserId));
          setIsFollowing(followingStatus.is_following);
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error('获取用户信息出错:', error);
        message.error(error.response?.data?.detail || '获取用户信息失败，请稍后重试');
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate, isOtherUser, otherUserId]);

  // 获取博客列表
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        let data;
        if (isOtherUser && otherUserId) {
          // 获取其他用户的文章
          const response = await axios.get(`${API_URL}/blogs/user/${otherUserId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          data = response.data;
        } else {
          // 获取当前用户的文章
          switch (activeTab) {
            case 'articles':
              data = await getUserBlogs();
              break;
            case 'likes':
              data = await getUserLikedBlogs();
              break;
            case 'favorites':
              data = await getUserFavoriteBlogs();
              break;
            default:
              data = [];
          }
        }
        setBlogs(data || []);
      } catch (error: any) {
        console.error('获取博客列表出错:', error);
        message.error(error.response?.data?.detail || '获取博客列表失败，请稍后重试');
        setBlogs([]);
      }
    };

    if (userInfo) {
      fetchBlogs();
    }
  }, [activeTab, userInfo, isOtherUser, otherUserId]);

  // 获取关注和粉丝列表
  useEffect(() => {
    const fetchFollowingAndFollowers = async () => {
      if (!userInfo) return;

      try {
        const [followingData, followersData] = await Promise.all([
          getUserFollowing(Number(userInfo.id)),
          getUserFollowers(Number(userInfo.id))
        ]);

        setFollowing(followingData);
        setFollowers(followersData);

        // 初始化关注状态
        const initialFollowingMap = followingData.reduce((acc: Record<string, boolean>, user: User) => {
          acc[user.id] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setFollowingMap(initialFollowingMap);

        // 初始化粉丝关注状态 - 修改这部分逻辑
        const initialFollowerFollowingMap = followersData.reduce((acc: Record<string, boolean>, user: User) => {
          // 检查该粉丝是否在关注列表中
          acc[user.id] = followingData.some((following: User) => following.id === user.id);
          return acc;
        }, {} as Record<string, boolean>);
        setFollowerFollowingMap(initialFollowerFollowingMap);
      } catch (error: any) {
        console.error('获取关注和粉丝列表出错:', error);
        message.error(error.response?.data?.detail || '获取关注和粉丝列表失败，请稍后重试');
      }
    };

    if (userInfo) {
      fetchFollowingAndFollowers();
    }
  }, [userInfo]);

  // 加载消息列表
  const loadMessages = async () => {
    try {
      console.log('开始加载消息...');
      const response = await getMessages();
      console.log('获取到的消息数据:', response);

      if (!response || !Array.isArray(response)) {
        console.error('获取消息失败：返回数据格式不正确');
        setMessages([]);
        return;
      }

      // 按用户分组，只保留每个用户的最新消息
      const userMessages = response.reduce((acc: Record<string, Message>, msg: Message) => {
        if (!msg || !msg.sender || !msg.receiver) {
          console.log('跳过无效消息:', msg);
          return acc;
        }

        const otherUserId = msg.sender_id === Number(userInfo?.id) ? msg.receiver_id : msg.sender_id;

        if (!acc[otherUserId] || new Date(msg.created_at) > new Date(acc[otherUserId].created_at)) {
          acc[otherUserId] = msg;
        }
        return acc;
      }, {});

      console.log('处理后的用户消息:', userMessages);

      const sortedMessages = Object.values(userMessages).sort((a, b) =>
        new Date((b as Message).created_at).getTime() - new Date((a as Message).created_at).getTime()
      ) as Message[];

      console.log('排序后的消息列表:', sortedMessages);
      setMessages(sortedMessages);

      // 计算未读消息数量
      const unread = response.filter((msg: Message) =>
        !msg.is_read && msg.receiver_id === Number(userInfo?.id)
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('加载私信失败:', error);
      message.error('加载私信失败');
      setMessages([]);
    }
  };

  // 加载与特定用户的对话
  const loadConversation = async (userId: number) => {
    try {
      const response = await getConversation(userId);
      setConversation(response);
      // 标记未读消息为已读
      response.forEach((msg: Message) => {
        if (!msg.is_read && msg.receiver_id === Number(userInfo?.id)) {
          markMessageAsRead(msg.id);
        }
      });
    } catch (error) {
      console.error('加载对话失败:', error);
      message.error('加载对话失败');
    }
  };

  // 发送消息
  const handleSendMessage = async (receiverId: number, content: string) => {
    if (!content.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    try {
      const newMessage = await createMessage(receiverId, content);
      setConversation([...conversation, newMessage]);
      setNewMessage('');
      // 重新加载消息列表
      loadMessages();
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败');
    }
  };

  // 确保在组件加载和用户信息更新时加载消息
  useEffect(() => {
    if (userInfo && activeTab === 'messages') {
      console.log('触发消息加载，当前用户信息:', userInfo);
      loadMessages();
    }
  }, [userInfo, activeTab]);

  useEffect(() => {
    if (selectedUser) {
      loadConversation(selectedUser);
    }
  }, [selectedUser]);

  // 获取当前登录用户id
  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr);
        setCurrentUserId(user.id);
      } catch { }
    }
  }, []);

  const handleFollow = (userId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    if (Number(userId) === currentUserId) {
      message.warning('不能关注自己');
      return;
    }
    try {
      if (isFollowing) {
        await unfollowUser(Number(userId));
        message.success('已取消关注');
        setIsFollowing(false);
      } else {
        await followUser(Number(userId));
        message.success('关注成功');
        setIsFollowing(true);
      }
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          followers_count: isFollowing ? userInfo.followers_count - 1 : userInfo.followers_count + 1
        });
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败');
    }
  };

  const handleFollowerFollow = (userId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (userId === userInfo?.id) {
        message.warning('不能关注自己');
        return;
      }

      if (followerFollowingMap[userId]) {
        await unfollowUser(Number(userId));
        message.success('已取消关注');
      } else {
        await followUser(Number(userId));
        message.success('关注成功');
      }

      setFollowerFollowingMap(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败');
    }
  };

  const handleLike = async (blogId: number) => {
    try {
      const blog = blogs.find(b => b.id === blogId);
      if (!blog) return;

      if (blog.is_liked) {
        await unlikeBlog(blogId);
        blog.likes--;
        blog.is_liked = false;
      } else {
        await likeBlog(blogId);
        blog.likes++;
        blog.is_liked = true;
      }

      setBlogs([...blogs]);
      message.success(blog.is_liked ? '点赞成功' : '取消点赞成功');
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败');
    }
  };

  const handleFavorite = async (blogId: number) => {
    try {
      const blog = blogs.find(b => b.id === blogId);
      if (!blog) return;

      if (blog.is_favorited) {
        await unfavoriteBlog(blogId);
        blog.is_favorited = false;
      } else {
        await favoriteBlog(blogId);
        blog.is_favorited = true;
      }

      setBlogs([...blogs]);
      message.success(blog.is_favorited ? '收藏成功' : '取消收藏成功');
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败');
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo((prev: UserInfo | null) => prev ? { ...prev, avatar: data.avatar } : null);
        message.success('头像上传成功');
      } else {
        const errorData = await response.json();
        message.error(errorData.detail || '头像上传失败');
      }
    } catch (error) {
      console.error('上传头像出错:', error);
      message.error('上传头像失败，请稍后重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 处理简介更新
  const handleBioUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio: newBio }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo((prev: UserInfo | null) => prev ? { ...prev, bio: data.bio } : null);
        setIsEditingBio(false);
        message.success('简介更新成功');
      } else {
        message.error('简介更新失败');
      }
    } catch (error) {
      console.error('更新简介出错:', error);
      message.error('更新简介失败，请稍后重试');
    }
  };

  const getAvatar = (avatar: string | null) => {
    if (!avatar) {
      return <UserOutlined style={{ fontSize: '24px' }} />;
    }
    return <img src={avatar} alt="avatar" />;
  };

  const renderUserInfo = () => {
    if (!userInfo) {
      return <div>加载中...</div>;
    }

    return (
      <div className="profile-header">
        <div className="avatar-container">
          {!isOtherUser && (
            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={(file) => {
                handleAvatarUpload(file);
                return false;
              }}
              accept="image/*"
            >
              <div className="avatar-wrapper">
                <Avatar
                  size={100}
                  src={userInfo.avatar}
                  icon={<UserOutlined />}
                  className="avatar"
                />
                <div className="avatar-overlay">
                  <UploadOutlined />
                  <span>更换头像</span>
                </div>
              </div>
            </Upload>
          )}
          {isOtherUser && (
            <div className="avatar-wrapper">
              <Avatar
                size={100}
                src={userInfo.avatar}
                icon={<UserOutlined />}
                className="avatar"
              />
            </div>
          )}
        </div>
        <div className="profile-info">
          <h2>{userInfo.username}</h2>
          {isEditingBio ? (
            <div className="bio-edit">
              <Input.TextArea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="请输入个人简介"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
              <Space style={{ marginTop: 8 }}>
                <Button type="primary" onClick={handleBioUpdate}>
                  保存
                </Button>
                <Button onClick={() => setIsEditingBio(false)}>
                  取消
                </Button>
              </Space>
            </div>
          ) : (
            <p onClick={() => {
              if (!isOtherUser) {
                setNewBio(userInfo.bio || '');
                setIsEditingBio(true);
              }
            }} style={{ cursor: isOtherUser ? 'default' : 'pointer' }}>
              {userInfo.bio || '这个人很懒，什么都没写~'}
              {!isOtherUser && <EditOutlined />}
            </p>
          )}
          <div className="profile-actions">
            {isOtherUser && (
              <>
                <Button
                  type={isFollowing ? "default" : "primary"}
                  onClick={handleFollow(userInfo.id)}
                  icon={isFollowing ? <CheckOutlined /> : <UserAddOutlined />}
                >
                  {isFollowing ? '已关注' : '关注'}
                </Button>
                <Button onClick={() => handleMessageClick(Number(userInfo.id), userInfo.username, userInfo.avatar)}>私信</Button>
              </>
            )}
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{userInfo.followers_count}</span>
              <span className="stat-label">关注者</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userInfo.following_count}</span>
              <span className="stat-label">关注</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userInfo.articles_count}</span>
              <span className="stat-label">文章</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 处理私信按钮点击
  const handleMessageClick = (userId: number, username: string, avatar: string | null = null) => {
    // 跳转到chat页并传递对方信息
    navigate('/chat', {
      state: {
        userId,
        username,
        avatar
      }
    });
  };

  // 在组件加载时检查是否有需要打开的消息对话
  useEffect(() => {
    if (location.state?.selectedUser && location.state?.activeTab === 'messages') {
      setSelectedUser(location.state.selectedUser);
      setActiveTab('messages');
    }
  }, [location.state]);

  return (
    <div className="profile-container">
      <Card className="profile-card">
        {renderUserInfo()}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {!isOtherUser && (
            <>
              <TabPane
                tab={
                  <span>
                    <MailOutlined />
                    私信
                    {unreadCount > 0 && <Badge count={unreadCount} />}
                  </span>
                }
                key="messages"
              >
                {messages && messages.length > 0 ? (
                  <div className="message-container">
                    <div className="message-list">
                      <List
                        itemLayout="horizontal"
                        dataSource={messages}
                        renderItem={item => {
                          if (!item || !item.sender || !item.receiver) return null;

                          const otherUserId = item.sender_id === Number(userInfo?.id) ? item.receiver_id : item.sender_id;
                          const otherUsername = item.sender_id === Number(userInfo?.id) ? item.receiver.username : item.sender.username;
                          const otherAvatar = item.sender_id === Number(userInfo?.id) ? item.receiver.avatar : item.sender.avatar;
                          const isUnread = !item.is_read && item.receiver_id === Number(userInfo?.id);
                          const isSent = item.sender_id === Number(userInfo?.id);

                          return (
                            <List.Item
                              className={`message-item ${isUnread ? 'unread' : ''}`}
                              onClick={() => handleMessageClick(otherUserId, otherUsername, otherAvatar)}
                            >
                              <div className="message-item-content">
                                <Avatar src={otherAvatar} icon={<UserOutlined />} size={48} />
                                <div className="message-item-info">
                                  <div className="message-item-header">
                                    <span className="message-item-username">{otherUsername}</span>
                                    <span className="message-item-time">{formatDate(item.created_at)}</span>
                                  </div>
                                  <div className="message-item-preview">
                                    {isSent && <span className="message-sent-indicator">你：</span>}
                                    {item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                                  </div>
                                </div>
                                {isUnread && <div className="message-item-unread" />}
                              </div>
                            </List.Item>
                          );
                        }}
                      />
                    </div>
                    {selectedUser && (
                      <div className="conversation-container">
                        <div className="conversation-header">
                          <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedUser(null)}>
                            返回
                          </Button>
                          <span>与 {conversation[0]?.sender.username} 的对话</span>
                        </div>
                        <div className="conversation-messages">
                          {conversation.map(msg => (
                            <div
                              key={msg.id}
                              className={`message-bubble ${msg.sender_id === Number(userInfo?.id) ? 'sent' : 'received'}`}
                            >
                              <div className="message-content">{msg.content}</div>
                              <div className="message-time">{formatDate(msg.created_at)}</div>
                            </div>
                          ))}
                        </div>
                        <div className="message-input">
                          <Input.TextArea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="输入消息..."
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            onPressEnter={e => {
                              if (!e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(selectedUser, newMessage);
                              }
                            }}
                          />
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => handleSendMessage(selectedUser, newMessage)}
                            disabled={!newMessage.trim()}
                          >
                            发送
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <MailOutlined />
                    <div className="empty-state-text">暂无私信</div>
                    <div className="empty-state-subtext">关注感兴趣的用户，开始交流吧</div>
                    <Button type="primary" onClick={() => navigate('/')}>
                      去关注用户
                    </Button>
                  </div>
                )}
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    历史记录
                  </span>
                }
                key="history"
              >
                {blogs && blogs.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={blogs}
                    renderItem={(item: Blog) => (
                      <List.Item>
                        <List.Item.Meta
                          title={<Link to={`/detail/${item.id}`}>{item.title}</Link>}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-state">
                    <HistoryOutlined />
                    <div className="empty-state-text">暂无浏览记录</div>
                    <div className="empty-state-subtext">开始阅读文章，记录你的足迹</div>
                    <Button type="primary" onClick={() => navigate('/')}>
                      浏览文章
                    </Button>
                  </div>
                )}
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <LikeOutlined />
                    点赞
                  </span>
                }
                key="likes"
              >
                {blogs.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={blogs}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Link to={`/detail/${item.id}`} className="article-title">
                              {item.title}
                            </Link>
                          }
                          description={
                            <div className="article-meta">
                              {item.subtitle && (
                                <div className="article-subtitle">{item.subtitle}</div>
                              )}
                              <div className="article-description">{item.description}</div>
                              <div className="list-icons">
                                <span className="list-icon">
                                  <CalendarOutlined /> {formatDate(item.created_at)}
                                </span>
                                {item.tags && item.tags.length > 0 && (
                                  <span className="list-icon">
                                    <BarsOutlined /> {item.tags.join(', ')}
                                  </span>
                                )}
                                <span className="list-icon">
                                  <FireOutlined /> {item.views_count}
                                </span>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-state">
                    <LikeOutlined />
                    <div className="empty-state-text">暂无点赞文章</div>
                    <div className="empty-state-subtext">发现好文章，别忘了点赞支持</div>
                    <Button type="primary" onClick={() => navigate('/')}>
                      浏览文章
                    </Button>
                  </div>
                )}
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <StarOutlined />
                    收藏
                  </span>
                }
                key="favorites"
              >
                {blogs.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={blogs}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Link to={`/detail/${item.id}`} className="article-title">
                              {item.title}
                            </Link>
                          }
                          description={
                            <div className="article-meta">
                              {item.subtitle && (
                                <div className="article-subtitle">{item.subtitle}</div>
                              )}
                              <div className="article-description">{item.description}</div>
                              <div className="list-icons">
                                <span className="list-icon">
                                  <CalendarOutlined /> {formatDate(item.created_at)}
                                </span>
                                {item.tags && item.tags.length > 0 && (
                                  <span className="list-icon">
                                    <BarsOutlined /> {item.tags.join(', ')}
                                  </span>
                                )}
                                <span className="list-icon">
                                  <FireOutlined /> {item.views_count}
                                </span>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-state">
                    <StarOutlined />
                    <div className="empty-state-text">暂无收藏文章</div>
                    <div className="empty-state-subtext">收藏喜欢的文章，方便随时查看</div>
                    <Button type="primary" onClick={() => navigate('/')}>
                      浏览文章
                    </Button>
                  </div>
                )}
              </TabPane>
            </>
          )}
          <TabPane
            tab={
              <span>
                <EditOutlined />
                {isOtherUser ? '文章' : '我的文章'}
              </span>
            }
            key="articles"
          >
            {blogs && blogs.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={blogs}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Link to={`/detail/${item.id}`} className="article-title">
                          {item.title}
                        </Link>
                      }
                      description={
                        <div className="article-meta">
                          {item.subtitle && (
                            <div className="article-subtitle">{item.subtitle}</div>
                          )}
                          <div className="article-description">{item.description}</div>
                          <div className="list-icons">
                            <span className="list-icon">
                              <CalendarOutlined /> {formatDate(item.created_at)}
                            </span>
                            {item.tags && item.tags.length > 0 && (
                              <span className="list-icon">
                                <BarsOutlined /> {item.tags.join(', ')}
                              </span>
                            )}
                            <span className="list-icon">
                              <FireOutlined /> {item.views_count}
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="empty-state">
                <EditOutlined />
                <div className="empty-state-text">暂无{isOtherUser ? '文章' : '我的文章'}</div>
                <div className="empty-state-subtext">
                  {isOtherUser ? '这个用户还没有发布过文章' : '开始创作你的第一篇文章吧'}
                </div>
                {!isOtherUser && (
                  <Button type="primary" onClick={() => navigate('/editor')}>
                    写文章
                  </Button>
                )}
              </div>
            )}
          </TabPane>
          {!isOtherUser && (
            <>
              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    关注
                  </span>
                }
                key="following"
              >
                {following.length > 0 ? (
                  <List
                    grid={{ gutter: 16, column: 4 }}
                    dataSource={following}
                    renderItem={user => (
                      <List.Item>
                        <Card>
                          <div className="user-card">
                            <Avatar size={64} src={user.avatar} icon={<UserOutlined />} />
                            <h3>{user.name}</h3>
                            <p>{user.bio}</p>
                            <Space>
                              <Button
                                type={followingMap[user.id] ? 'default' : 'primary'}
                                block
                                onClick={handleFollow(user.id)}
                                icon={followingMap[user.id] ? <CheckOutlined /> : <UserAddOutlined />}
                              >
                                {followingMap[user.id] ? '已关注' : '关注'}
                              </Button>
                              <Button block onClick={() => handleMessageClick(Number(user.id), user.username, user.avatar)}>私信</Button>
                            </Space>
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-state">
                    <UserOutlined />
                    <div className="empty-state-text">暂无关注</div>
                    <div className="empty-state-subtext">关注感兴趣的用户，获取更多精彩内容</div>
                    <Button type="primary" onClick={() => navigate('/')}>
                      浏览文章
                    </Button>
                  </div>
                )}
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <HeartOutlined />
                    粉丝
                  </span>
                }
                key="followers"
              >
                {followers.length > 0 ? (
                  <List
                    grid={{ gutter: 16, column: 4 }}
                    dataSource={followers}
                    renderItem={user => (
                      <List.Item>
                        <Card>
                          <div className="user-card">
                            <Avatar size={64} src={user.avatar} icon={<UserOutlined />} />
                            <h3>{user.name}</h3>
                            <p>{user.bio}</p>
                            <Space>
                              <Button
                                type={followerFollowingMap[user.id] ? 'default' : 'primary'}
                                block
                                onClick={handleFollowerFollow(user.id)}
                                icon={followerFollowingMap[user.id] ? <CheckOutlined /> : <UserAddOutlined />}
                              >
                                {followerFollowingMap[user.id] ? '已关注' : '关注'}
                              </Button>
                              <Button block onClick={() => handleMessageClick(Number(user.id), user.username, user.avatar)}>私信</Button>
                            </Space>
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="empty-state">
                    <HeartOutlined />
                    <div className="empty-state-text">暂无粉丝</div>
                    <div className="empty-state-subtext">分享你的文章，让更多人认识你</div>
                    <Button type="primary" onClick={() => navigate('/editor')}>
                      写文章
                    </Button>
                  </div>
                )}
              </TabPane>
            </>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile; 