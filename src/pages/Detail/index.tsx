import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row, Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import Author from '../Home/Author/Author';
import Advert from '../Home/Advert/Advert';
import { CalendarOutlined, FireOutlined, FolderOpenOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';
import "./index.css";
import MarkdownToc from '../../components/MarkdownToc';
import InteractionButtons from '../../components/InteractionButtons';
import Comments from '../../components/Comments';

const markdown = `
## 基础语法
### 标题
# H1
## H2
### H3
#### H4

### 文本格式
*斜体文本*  
**粗体文本**  
~~删除线文本~~  
<mark>高亮文本</mark>  
行内\`代码\`示例  
H<sub>2</sub>O 下标  
X<sup>2</sup> 上标

### 列表
- 无序列表项
- 嵌套列表
  - 子项1
  - 子项2

1. 有序列表项
2. 第二项
   1. 嵌套有序列表

### 代码块
\`\`\`javascript
const hello = () => {
  console.log('Hello, World!');
}
\`\`\`

### 表格
| 表头1 | 表头2 |
|-------|-------|
| 内容1 | 内容2 |
| 内容3 | 内容4 |

### 引用
> 这是一段引用文本
> 可以有多行
`;

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [showComments, setShowComments] = useState(false);

  const breadList = [
    {
      title: "首页",
      path: "/"
    },
    {
      title: "列表",
      path: "/list"
    },
    {
      title: "详情",
      path: `/detail/${id}`
    }
  ];

  return (
    <div>
      <Row className='comm-main' justify={"center"}>
        <Col className='comm-left' xs={24} sm={24} md={16} lg={18} xl={14}>
          <div className='bread-div'>
            <Breadcrumb
              items={breadList.map(item => ({
                title: <Link to={item.path}>{item.title}</Link>,
                className: location.pathname === item.path ? 'active' : ''
              }))}
            />
          </div>
          <div>
            <div className='detail-title'>
              react 文章详情页
            </div>
            <div className='list-icons center'>
              <span className='list-icon'><CalendarOutlined /> 2024-10-22 </span>
              <span className='list-icon'><FolderOpenOutlined /> 视频教学 </span>
              <span className='list-icon'><FireOutlined /> 1234人 </span>
            </div>
            <div className='detail-content'>
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
            <InteractionButtons
              initialLikes={123}
              initialStars={45}
              initialComments={67}
              onCommentClick={() => setShowComments(!showComments)}
            />
            {showComments && <Comments />}
          </div>
        </Col>
        <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={4}>
          <Author />
          <div className="toc-container">
            <MarkdownToc />
          </div>
          <Advert />
        </Col>
      </Row>
    </div>
  );
};

export default Detail;
