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
  UploadOutlined
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
import { followUser, unfollowUser } from '../../api/user';

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

  const {
    articles,
    following,
    followers,
    activeTab
  } = useSelector((state: RootState) => state.profile);
  const { messages, unreadCount } = useSelector((state: RootState) => state.message);

  // 获取用户真实数据
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        let retryCount = 0;
        const maxRetries = 3;
        let lastError = null;

        while (retryCount < maxRetries) {
          try {
            const url = isOtherUser
              ? `http://localhost:8000/api/v1/users/${otherUserId}`
              : 'http://localhost:8000/api/v1/users/me';

            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              setUserInfo(data);
              setIsLoading(false);
              return;
            } else if (response.status === 401) {
              console.error('Token 验证失败:', token);
              localStorage.removeItem('token');
              localStorage.removeItem('userInfo');
              navigate('/auth');
              return;
            } else {
              const errorData = await response.json().catch(() => ({}));
              lastError = errorData.detail || '获取用户信息失败';

              if (retryCount < maxRetries - 1) {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                continue;
              }
            }
          } catch (error) {
            lastError = '请求出错';
            if (retryCount < maxRetries - 1) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
          }
        }

        if (lastError) {
          message.error(lastError);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('获取用户信息出错:', error);
        message.error('获取用户信息失败，请稍后重试');
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate, isOtherUser, otherUserId]);

  // 获取其他mock数据
  useEffect(() => {
    const fetchMockData = async () => {
      const mockData = {
        messages: [
          {
            id: '1',
            sender: {
              id: '2',
              name: '用户A',
              avatar: ''
            },
            content: '你好，请问这篇文章的代码可以分享一下吗？',
            createTime: '2024-01-01 12:00',
            isRead: false
          },
          {
            id: '2',
            sender: {
              id: '3',
              name: '用户B',
              avatar: ''
            },
            content: '感谢你的分享，对我帮助很大！',
            createTime: '2024-01-01 10:00',
            isRead: false
          }
        ],
        articles: [
          {
            id: '1',
            title: '示例文章标题',
            description: '这是文章的简要描述...',
            createTime: '2024-01-01',
            views: 100,
            likes: 10,
            comments: 5
          }
        ],
        following: [
          {
            id: '1',
            name: '关注用户1',
            avatar: '',
            bio: '个人简介1'
          }
        ],
        followers: [
          {
            id: '1',
            name: '粉丝1',
            avatar: '',
            bio: '个人简介1'
          }
        ]
      };

      dispatch(setMessages(mockData.messages));
      dispatch(setArticles(mockData.articles));
      dispatch(setFollowing(mockData.following));
      dispatch(setFollowers(mockData.followers));
    };

    fetchMockData();
  }, [dispatch]);

  useEffect(() => {
    // 初始化关注状态
    const initialFollowingMap = following.reduce((acc, user) => {
      acc[user.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setFollowingMap(initialFollowingMap);

    // 初始化粉丝关注状态
    const initialFollowerFollowingMap = followers.reduce((acc, user) => {
      // 这里应该从后端获取实际的关注状态
      acc[user.id] = false; // 默认未关注
      return acc;
    }, {} as Record<string, boolean>);
    setFollowerFollowingMap(initialFollowerFollowingMap);
  }, [following, followers]);

  const handleMessage = (userId: string) => {
    if (!userInfo) return;
    if (userId === userInfo.id) {
      message.warning('不能给自己发送私信');
      return;
    }
    navigate(`/chat/${userId}`);
  };

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
        // 直接使用返回的BASE64数据
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
            {!isOtherUser && (
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
        <Tabs activeKey={activeTab} onChange={(key) => dispatch(setActiveTab(key))}>
          {!isOtherUser && (
            <>
              <TabPane
                tab={
                  <span>
                    <MailOutlined />
                    <Badge count={unreadCount} offset={[5, 0]}>
                      私信
                    </Badge>
                  </span>
                }
                key="messages"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={messages}
                  renderItem={message => (
                    <List.Item
                      className={`message-item ${!message.isRead ? 'unread' : ''}`}
                      onClick={() => handleMessage(message.sender.id)}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={message.sender.avatar} icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <span>{message.sender.name}</span>
                            {!message.isRead && <Badge status="processing" />}
                          </Space>
                        }
                        description={
                          <div className="message-content">
                            <p>{message.content}</p>
                            <span className="message-time">{message.createTime}</span>
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
                    <HistoryOutlined />
                    历史记录
                  </span>
                }
                key="history"
              >
                <List
                  itemLayout="vertical"
                  dataSource={articles}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Space>
                          <span><EyeOutlined /> {item.views}</span>
                          <span><LikeOutlined /> {item.likes}</span>
                          <span><MessageOutlined /> {item.comments}</span>
                        </Space>
                      ]}
                    >
                      <List.Item.Meta
                        title={<Link to={`/detail/${item.id}`}>{item.title}</Link>}
                        description={item.description}
                      />
                      <div className="article-meta">
                        <Tag>{item.createTime}</Tag>
                      </div>
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
                  dataSource={articles}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Space>
                          <span><EyeOutlined /> {item.views}</span>
                          <span><LikeOutlined /> {item.likes}</span>
                          <span><MessageOutlined /> {item.comments}</span>
                        </Space>
                      ]}
                    >
                      <List.Item.Meta
                        title={<Link to={`/detail/${item.id}`}>{item.title}</Link>}
                        description={item.description}
                      />
                      <div className="article-meta">
                        <Tag>{item.createTime}</Tag>
                      </div>
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
                  dataSource={articles}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Space>
                          <span><EyeOutlined /> {item.views}</span>
                          <span><LikeOutlined /> {item.likes}</span>
                          <span><MessageOutlined /> {item.comments}</span>
                        </Space>
                      ]}
                    >
                      <List.Item.Meta
                        title={<Link to={`/detail/${item.id}`}>{item.title}</Link>}
                        description={item.description}
                      />
                      <div className="article-meta">
                        <Tag>{item.createTime}</Tag>
                      </div>
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
              dataSource={articles}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Space>
                      <Button type="primary" size="small">编辑</Button>
                      <Button danger size="small">删除</Button>
                    </Space>,
                    <Space>
                      <span><EyeOutlined /> {item.views}</span>
                      <span><LikeOutlined /> {item.likes}</span>
                      <span><MessageOutlined /> {item.comments}</span>
                    </Space>
                  ]}
                >
                  <List.Item.Meta
                    title={<Link to={`/detail/${item.id}`}>{item.title}</Link>}
                    description={item.description}
                  />
                  <div className="article-meta">
                    <Tag>{item.createTime}</Tag>
                  </div>
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