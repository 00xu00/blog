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
import './AIHelper.css';

interface Article {
  id: string;
  title: string;
  description: string;
  tags: string[];
  views: number;
  likes: number;
}

interface WritingSuggestion {
  type: 'outline' | 'code' | 'documentation';
  content: string;
}

const { TabPane } = Tabs;

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
      // TODO: 这里需要调用后端API获取推荐文章
      // 模拟数据
      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'React Hooks 最佳实践',
          description: '深入探讨React Hooks的使用技巧和最佳实践，包括useState、useEffect、useContext等核心Hook的使用方法。',
          tags: ['React', 'Hooks', '前端'],
          views: 1234,
          likes: 89
        },
        {
          id: '2',
          title: 'TypeScript 类型系统详解',
          description: '全面解析TypeScript的类型系统和高级特性，帮助你写出更健壮的代码。',
          tags: ['TypeScript', '类型系统'],
          views: 2345,
          likes: 156
        }
      ];
      setRecommendedArticles(mockArticles);
    } catch (error) {
      message.error('获取推荐文章失败');
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
      // TODO: 这里需要调用后端API生成写作建议
      // 模拟数据
      const mockSuggestions: WritingSuggestion[] = [
        {
          type: 'outline' as const,
          content: `1. 引言\n   - 介绍React Hooks的背景和重要性\n   - 为什么需要学习Hooks\n2. 核心概念\n   - useState的使用方法和最佳实践\n   - useEffect的生命周期管理\n   - useContext的状态共享\n3. 实践案例\n   - 自定义Hook的创建和使用\n   - 常见问题的解决方案\n4. 总结\n   - Hooks的优势和局限性\n   - 未来发展趋势`
        },
        {
          type: 'code' as const,
          content: '```typescript\n// 自定义Hook示例\nconst useCounter = (initialValue: number = 0) => {\n  const [count, setCount] = useState(initialValue);\n\n  const increment = () => setCount(count + 1);\n  const decrement = () => setCount(count - 1);\n  const reset = () => setCount(initialValue);\n\n  return { count, increment, decrement, reset };\n};\n\n// 使用示例\nconst Counter = () => {\n  const { count, increment, decrement } = useCounter(0);\n\n  return (\n    <div>\n      <p>当前计数: {count}</p>\n      <button onClick={increment}>增加</button>\n      <button onClick={decrement}>减少</button>\n    </div>\n  );\n};\n```'
        },
        {
          type: 'documentation' as const,
          content: '1. React官方文档：https://reactjs.org/docs/hooks-intro.html\n2. React Hooks完全指南：https://react-hooks-cheatsheet.com/\n3. TypeScript + React最佳实践：https://react-typescript-cheatsheet.netlify.app/'
        }
      ];
      setWritingSuggestions(mockSuggestions);
    } catch (error) {
      message.error('生成写作建议失败');
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
                    <pre className="suggestion-content">{item.content}</pre>
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
                      onClick={() => navigate(`/article/${item.id}`)}
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
                        <p>{item.description}</p>
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