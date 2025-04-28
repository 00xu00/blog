import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, List, Avatar, Space, Badge, Button, Card, Tag, message } from 'antd';
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
  CheckOutlined
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
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followerFollowingMap, setFollowerFollowingMap] = useState<Record<string, boolean>>({});

  const {
    userInfo,
    articles,
    following,
    followers,
    activeTab
  } = useSelector((state: RootState) => state.profile);
  const { messages, unreadCount } = useSelector((state: RootState) => state.message);

  useEffect(() => {
    // 模拟获取数据
    const fetchData = async () => {
      // 这里应该是实际的API调用
      const mockData = {
        userInfo: {
          id: '1',
          name: '用户名',
          avatar: '',
          bio: '个人简介',
          stats: {
            articles: 10,
            followers: 100,
            following: 50
          }
        },
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

      dispatch(setProfile(mockData.userInfo));
      dispatch(setMessages(mockData.messages));
      dispatch(setArticles(mockData.articles));
      dispatch(setFollowing(mockData.following));
      dispatch(setFollowers(mockData.followers));
    };

    fetchData();
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
    if (userId === userInfo.id) {
      message.warning('不能给自己发送私信');
      return;
    }
    navigate(`/chat/${userId}`);
  };

  const handleFollow = (userId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (userId === userInfo.id) {
      message.warning('不能关注自己');
      return;
    }
    setFollowingMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    message.success(followingMap[userId] ? '已取消关注' : '关注成功');
  };

  const handleFollowerFollow = (userId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (userId === userInfo.id) {
      message.warning('不能关注自己');
      return;
    }
    setFollowerFollowingMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    message.success(followerFollowingMap[userId] ? '已取消关注' : '关注成功');
  };

  const renderUserInfo = () => (
    <div className="profile-header">
      <div className="profile-avatar">
        <Avatar size={100} src={userInfo.avatar} icon={<UserOutlined />} />
      </div>
      <div className="profile-info">
        <h2>{userInfo.name}</h2>
        <p>{userInfo.bio}</p>
        <Space>
          <Button type="primary" onClick={handleFollow(userInfo.id)}>
            <UserAddOutlined /> 关注
          </Button>
          <Button onClick={() => handleMessage(userInfo.id)}>私信</Button>
        </Space>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">{userInfo.stats.followers}</span>
            <span className="stat-label">关注者</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{userInfo.stats.following}</span>
            <span className="stat-label">关注</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{userInfo.stats.articles}</span>
            <span className="stat-label">文章</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <Card className="profile-card">
        {renderUserInfo()}
        <Tabs activeKey={activeTab} onChange={(key) => dispatch(setActiveTab(key))}>
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
                    title={<a href={`/detail/${item.id}`}>{item.title}</a>}
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
                    title={<a href={`/detail/${item.id}`}>{item.title}</a>}
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
                    title={<a href={`/detail/${item.id}`}>{item.title}</a>}
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
                <EditOutlined />
                我的文章
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
                    title={<a href={`/detail/${item.id}`}>{item.title}</a>}
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
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile; 