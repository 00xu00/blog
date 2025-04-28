import React, { useState, useEffect } from 'react';
import { Tabs, Card, List, Avatar, Button, Space, Tag, message, Badge } from 'antd';
import {
  HistoryOutlined,
  LikeOutlined,
  StarOutlined,
  EditOutlined,
  UserAddOutlined,
  UserOutlined,
  BookOutlined,
  HeartOutlined,
  EyeOutlined,
  MessageOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { markAsRead, Message } from '../../store/messageSlice';
import './index.css';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

interface Article {
  id: string;
  title: string;
  description: string;
  createTime: string;
  views: number;
  likes: number;
  comments: number;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  articles: number;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [user, setUser] = useState<User>({
    id: '1',
    name: '用户名',
    avatar: '',
    bio: '这个人很懒，什么都没写',
    followers: 0,
    following: 0,
    articles: 0
  });

  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: '示例文章标题',
      description: '这是文章的简要描述...',
      createTime: '2024-01-01',
      views: 100,
      likes: 10,
      comments: 5
    }
  ]);

  const { messages, unreadCount } = useSelector((state: RootState) => state.message);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFollow = () => {
    message.success('关注成功');
  };

  const handleUnfollow = () => {
    message.success('已取消关注');
  };

  const handleMessageClick = (message: Message) => {
    if (!message.isRead) {
      dispatch(markAsRead(message.id));
    }
    // 跳转到聊天页面
    navigate(`/chat/${message.sender.id}`);
  };

  const renderUserInfo = () => (
    <div className="profile-header">
      <div className="profile-avatar">
        <Avatar size={100} icon={<UserOutlined />} />
      </div>
      <div className="profile-info">
        <h2>{user.name}</h2>
        <p>{user.bio}</p>
        <Space>
          <Button type="primary" onClick={handleFollow}>
            <UserAddOutlined /> 关注
          </Button>
          <Button>私信</Button>
        </Space>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">{user.followers}</span>
            <span className="stat-label">关注者</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{user.following}</span>
            <span className="stat-label">关注</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{user.articles}</span>
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
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <MailOutlined />
                私信
                <Badge count={unreadCount} offset={[5, 0]} />
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
                  onClick={() => handleMessageClick(message)}
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
              dataSource={[1, 2, 3, 4]}
              renderItem={item => (
                <List.Item>
                  <Card>
                    <div className="user-card">
                      <Avatar size={64} icon={<UserOutlined />} />
                      <h3>用户名 {item}</h3>
                      <p>个人简介...</p>
                      <Button type="primary" block onClick={handleFollow}>
                        关注
                      </Button>
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
              dataSource={[1, 2, 3, 4]}
              renderItem={item => (
                <List.Item>
                  <Card>
                    <div className="user-card">
                      <Avatar size={64} icon={<UserOutlined />} />
                      <h3>用户名 {item}</h3>
                      <p>个人简介...</p>
                      <Button type="primary" block onClick={handleFollow}>
                        关注
                      </Button>
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