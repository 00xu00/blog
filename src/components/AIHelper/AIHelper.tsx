import React, { useState } from 'react';
import { Card, List, Input, Button, message, Spin, Tabs, Tag, Space, Tooltip } from 'antd';
import {
  RobotOutlined,
  BulbOutlined,
  CodeOutlined,
  FileTextOutlined,
  BookOutlined,
  StarOutlined,
  LoadingOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';
import './AIHelper.css';

interface Article {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  views: number;
  likes: number;
}

interface WritingSuggestion {
  type: 'outline' | 'code' | 'documentation';
  content: string;
}

const { TabPane } = Tabs;
const API_BASE_URL = 'http://localhost:8000/api/v1';

const AIHelper: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [articleTopic, setArticleTopic] = useState('');
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [writingSuggestions, setWritingSuggestions] = useState<WritingSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('1');
  const navigate = useNavigate();

  // 获取推荐文章
  const fetchRecommendedArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/recommended-articles`);
      setRecommendedArticles(response.data);
    } catch (error) {
      message.error('获取推荐文章失败');
      console.error('Error fetching recommended articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成写作建议
  const generateWritingSuggestions = async () => {
    if (!articleTopic) {
      message.warning('请输入文章主题');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/generate-suggestions`, {
        topic: articleTopic
      });
      setWritingSuggestions(response.data);
    } catch (error) {
      message.error('生成写作建议失败');
      console.error('Error generating writing suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'outline':
        return <FileTextOutlined />;
      case 'code':
        return <CodeOutlined />;
      case 'documentation':
        return <BookOutlined />;
      default:
        return <BulbOutlined />;
    }
  };

  const components: Components = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <pre className={className}>
          <code {...props}>
            {String(children).replace(/\n$/, '')}
          </code>
        </pre>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="ai-helper-container">
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="ai-helper-tabs">
        <TabPane tab={<span><RobotOutlined /> AI写作助手</span>} key="1">
          <Card className="ai-writer-card">
            <div className="ai-writer-header">
              <h2>AI写作助手</h2>
              <p>输入文章主题，让AI帮你生成写作建议</p>
            </div>
            <div className="ai-writer-input">
              <Input
                placeholder="输入文章主题或关键词"
                value={articleTopic}
                onChange={(e) => setArticleTopic(e.target.value)}
                prefix={<BulbOutlined />}
                size="large"
                className="topic-input"
              />
              <Button
                type="primary"
                onClick={generateWritingSuggestions}
                loading={loading}
                size="large"
                className="generate-btn"
              >
                生成写作建议
              </Button>
            </div>

            {writingSuggestions.length > 0 && (
              <div className="suggestions-container">
                {writingSuggestions.map((item, index) => (
                  <Card
                    key={index}
                    className="suggestion-card"
                    title={
                      <Space>
                        {getSuggestionIcon(item.type)}
                        <span>
                          {item.type === 'outline' && '文章大纲'}
                          {item.type === 'code' && '代码示例'}
                          {item.type === 'documentation' && '技术文档'}
                        </span>
                      </Space>
                    }
                  >
                    <div className="suggestion-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={components}
                      >
                        {item.content}
                      </ReactMarkdown>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabPane>

        <TabPane tab={<span><StarOutlined /> 推荐文章</span>} key="2">
          <Card className="recommendations-card">
            <div className="recommendations-header">
              <h2>推荐文章</h2>
              <p>基于你的兴趣和阅读历史推荐的优质文章</p>
            </div>
            <Button
              type="primary"
              onClick={fetchRecommendedArticles}
              loading={loading}
              size="large"
              className="fetch-btn"
            >
              获取推荐文章
            </Button>
            <List
              className="article-list"
              dataSource={recommendedArticles}
              renderItem={(item) => (
                <List.Item
                  className="article-item"
                  actions={[
                    <Tooltip title="阅读量">
                      <span><FireOutlined /> {item.views}</span>
                    </Tooltip>,
                    <Tooltip title="点赞数">
                      <span><StarOutlined /> {item.likes}</span>
                    </Tooltip>,
                    <Button
                      type="link"
                      onClick={() => navigate(`/detail/${item.id}`)}
                      className="read-more-btn"
                    >
                      阅读全文
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={<h3 className="article-title">{item.title}</h3>}
                    description={
                      <div className="article-description">
                        <p>{item.subtitle}</p>
                        <div className="article-tags">
                          {item.tags.map(tag => (
                            <Tag key={tag} color="blue">{tag}</Tag>
                          ))}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AIHelper; 