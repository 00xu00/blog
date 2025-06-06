import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Select, Tag, Button, Space, message, Spin, Popover } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';
import './index.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 配置axios默认值
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 从localStorage获取token
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const { TextArea } = Input;
const { Option } = Select;

const Editor: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [blogId, setBlogId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionSuggestions, setCompletionSuggestions] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  // 清空编辑器
  const clearEditor = () => {
    setTitle('');
    setSubtitle('');
    setCategory('');
    setTags([]);
    setInputValue('');
    setMarkdown('');
    setBlogId(null);
  };

  // 获取草稿博客
  const fetchDraftBlog = async () => {
    try {
      const response = await axios.get('/api/v1/blogs/user/me/draft');
      const draftBlog = response.data;

      // 只有当草稿博客有内容时才回填数据
      if (draftBlog.content || draftBlog.title !== "新博客") {
        setTitle(draftBlog.title);
        setSubtitle(draftBlog.subtitle || '');
        setTags(draftBlog.tags || []);
        setMarkdown(draftBlog.content);
        setBlogId(draftBlog.id);
        message.info('已加载草稿博客');
      }
    } catch (error: any) {
      // 如果是404错误（没有找到草稿），不显示错误提示
      if (error.response?.status === 404) {
        console.log('没有找到草稿博客');
        return;
      }
      // 其他错误才显示错误提示
      console.error('获取草稿博客失败:', error);
      message.error('获取草稿博客失败');
    }
  };

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/auth');
      return;
    }

    // 获取草稿博客
    fetchDraftBlog();
  }, [navigate]);

  const handleTagClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
  };

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
    }
    setInputValue('');
  };

  const handleSave = async (isPublish: boolean = false) => {
    if (!title) {
      message.warning('请输入文章标题');
      return;
    }
    if (!markdown) {
      message.warning('请输入文章内容');
      return;
    }

    try {
      setLoading(true);
      const blogData = {
        title,
        subtitle,
        content: markdown,
        tags,
        is_published: isPublish ? 1 : 0
      };

      // 确保token存在
      const token = localStorage.getItem('token');
      if (!token) {
        message.warning('请先登录');
        navigate('/auth');
        return;
      }

      // 设置请求头
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let response;
      if (blogId) {
        // 更新博客
        response = await axios.put(`/api/v1/blogs/${blogId}`, blogData, { headers });
        message.success('更新成功');
      } else {
        // 创建新博客
        response = await axios.post('/api/v1/blogs', blogData, { headers });
        setBlogId(response.data.id);
        message.success('保存成功');
      }

      if (isPublish) {
        message.success('发布成功');
        clearEditor(); // 清空编辑器
        // 跳转到文章详情页
        navigate(`/detail/${response.data.id}`);
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      if (error.response?.status === 401) {
        message.error('登录已过期，请重新登录');
        navigate('/auth');
      } else {
        message.error('保存失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (editor && preview) {
      const handleEditorScroll = () => {
        if (editor.scrollTop !== preview.scrollTop) {
          preview.scrollTop = editor.scrollTop;
        }
      };

      const handlePreviewScroll = () => {
        if (preview.scrollTop !== editor.scrollTop) {
          editor.scrollTop = preview.scrollTop;
        }
      };

      editor.addEventListener('scroll', handleEditorScroll);
      preview.addEventListener('scroll', handlePreviewScroll);

      return () => {
        editor.removeEventListener('scroll', handleEditorScroll);
        preview.removeEventListener('scroll', handlePreviewScroll);
      };
    }
  }, []);

  // 获取代码补全建议
  const getCompletion = async () => {
    if (!markdown) {
      message.warning('请先输入一些内容');
      return;
    }

    try {
      setCompletionLoading(true);
      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: `请根据以下内容提供补全建议：\n${markdown}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      }, {
        headers: {
          'Authorization': `Bearer sk-5917a900fb8b4246b4a3e449bc6c1275`,
          'Content-Type': 'application/json'
        }
      });

      const suggestions = response.data.choices[0].message.content.split('\n').filter(Boolean);
      setCompletionSuggestions(suggestions);
      setShowCompletion(true);
    } catch (error) {
      console.error('获取补全建议失败:', error);
      message.error('获取补全建议失败');
    } finally {
      setCompletionLoading(false);
    }
  };

  // 应用补全建议
  const applyCompletion = (suggestion: string) => {
    setMarkdown(prev => prev + '\n' + suggestion);
    setShowCompletion(false);
  };

  return (
    <div className="editor-container">
      <Spin spinning={loading} tip="正在处理中...">
        <Card className="editor-card">
          <div className="editor-header">
            <Input
              placeholder="请输入文章标题"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="editor-title"
              disabled={loading}
            />
            <Input
              placeholder="请输入文章副标题（可选）"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="editor-subtitle"
              disabled={loading}
            />
            <Space className="editor-meta">
              {/* <Select
                placeholder="选择分类"
                style={{ width: 120 }}
                value={category}
                onChange={setCategory}
              >
                <Option value="技术">技术</Option>
                <Option value="生活">生活</Option>
                <Option value="随笔">随笔</Option>
              </Select> */}
              <div className="editor-tags">
                {tags.map(tag => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleTagClose(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
                <Input
                  type="text"
                  size="small"
                  className="tag-input"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                  placeholder="添加标签"
                  disabled={loading}
                />
              </div>
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleSave(false)}
                  disabled={loading}
                >
                  保存草稿
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleSave(true)}
                  disabled={loading}
                >
                  发布文章
                </Button>
                <Popover
                  content={
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {completionSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '8px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onClick={() => applyCompletion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  }
                  title="补全建议"
                  trigger="click"
                  open={showCompletion}
                  onOpenChange={setShowCompletion}
                >
                  <Button
                    type="default"
                    onClick={getCompletion}
                    loading={completionLoading}
                  >
                    智能补全
                  </Button>
                </Popover>
              </Space>
            </Space>
          </div>
          <div className="editor-content">
            <div className="editor-preview-container">
              <div className="editor-area" ref={editorRef}>
                <TextArea
                  ref={textareaRef}
                  value={markdown}
                  onChange={e => setMarkdown(e.target.value)}
                  placeholder="开始写作..."
                  autoSize={true}
                  style={{ resize: 'none' }}
                  className="markdown-editor"
                  disabled={loading}
                />
              </div>
              <div className="preview-area" ref={previewRef}>
                <div className="preview-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    skipHtml={false}
                    components={{
                      mark: ({ children }) => <mark className="markdown-highlight">{children}</mark>,
                      sub: ({ children }) => <sub className="markdown-sub">{children}</sub>,
                      sup: ({ children }) => <sup className="markdown-sup">{children}</sup>
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default Editor; 