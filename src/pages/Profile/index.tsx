import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  FireOutlined
} from '@ant-design/icons';
import { RootState } from '../../store';
import {
  setProfile,
  setArticles,
  setFollowing,
  setFollowers,
  setActiveTab
} from '../../store/profile/actions';
import { setMessages, markAsRead } from '../../store/messageSlice';
import { ProfileState } from '../../store/profile/types';
import './index.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getUserInfo, getUserFollowing, getUserFollowers, followUser, unfollowUser } from '../../api/user';
import { getUserBlogs, getUserLikedBlogs, getUserFavoriteBlogs, likeBlog, unlikeBlog, favoriteBlog, unfavoriteBlog } from '../../api/blog';
import { formatDate } from '../../utils/date';
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
  id: string;
  sender: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch();
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

  const {
    articles,
    following: reduxFollowing,
    followers: reduxFollowers,
    activeTab: reduxActiveTab
  } = useSelector((state: RootState) => state.profile);
  const { messages, unreadCount } = useSelector((state: RootState) => state.message);

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
        setBlogs(data);
      } catch (error: any) {
        console.error('获取博客列表出错:', error);
        message.error(error.response?.data?.detail || '获取博客列表失败，请稍后重试');
      }
    };

    if (userInfo) {
      fetchBlogs();
    }
  }, [activeTab, userInfo]);

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

        // 初始化粉丝关注状态
        const initialFollowerFollowingMap = followersData.reduce((acc: Record<string, boolean>, user: User) => {
          acc[user.id] = false;
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

  // 处理私信
  const handleMessage = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  // 标记消息为已读
  const handleMarkAsRead = (messageId: string) => {
    dispatch(markAsRead(messageId));
  };

  // 加载私信列表
  const loadMessages = async () => {
    try {
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      dispatch(setMessages(data));
    } catch (error) {
      message.error('加载私信失败');
    }
  };

  // 加载历史记录
  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      dispatch(setArticles(data));
    } catch (error) {
      message.error('加载历史记录失败');
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const handleFollow = (userId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (userId === userInfo?.id) {
        message.warning('不能关注自己');
        return;
      }

      if (followingMap[userId]) {
        await unfollowUser(Number(userId));
        message.success('已取消关注');
      } else {
        await followUser(Number(userId));
        message.success('关注成功');
      }

      setFollowingMap(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
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
                <Button type="primary" onClick={handleFollow(userInfo.id)}>
                  <UserAddOutlined /> 关注
                </Button>
                <Button onClick={() => handleMessage(userInfo.id)}>私信</Button>
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
                <List
                  itemLayout="horizontal"
                  dataSource={messages}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button type="link" onClick={() => handleMessage(item.sender.id)}>
                          回复
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={item.sender.avatar} />}
                        title={item.sender.name}
                        description={item.content}
                      />
                    </List.Item>
                  )}
                />
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
                <List
                  itemLayout="horizontal"
                  dataSource={articles}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={<Link to={`/detail/${item.id}`}>{item.title}</Link>}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
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
                            <Button block onClick={() => handleMessage(user.id)}>私信</Button>
                          </Space>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
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
                            <Button block onClick={() => handleMessage(user.id)}>私信</Button>
                          </Space>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </TabPane>
            </>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile; 