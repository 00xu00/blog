import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Col, Row, Breadcrumb, message, Spin } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import Author from '../Home/Author/Author';
import Advert from '../Home/Advert/Advert';
import { CalendarOutlined, FireOutlined, BarsOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';
import "./index.css";
import MarkdownToc from '../../components/MarkdownToc';
import InteractionButtons from '../../components/InteractionButtons';
import Comments from '../../components/Comments';
import { getBlogDetail, likeBlog, unlikeBlog, favoriteBlog, unfavoriteBlog } from '../../api/blog';
import { formatDate } from '../../utils/date';

interface BlogAuthor {
  id: number;
  username: string;
  avatar?: string;
  bio?: string;
  introduction?: string;
  social_links?: {
    github?: string;
    [key: string]: string | undefined;
  };
}

interface Blog {
  id: number;
  title: string;
  subtitle?: string;
  content: string;
  created_at: string;
  views_count: number;
  likes_count: number;
  favorites_count: number;
  comments_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  tags?: string[];
  author: BlogAuthor;
}

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [likes, setLikes] = useState(0);
  const [favorites, setFavorites] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      const response = await getBlogDetail(Number(id));
      // console.log('detail data', response.data);

      setBlog(response.data);
      setLikes(response.data.likes_count);
      setFavorites(response.data.favorites_count);
      setIsLiked(response.data.is_liked);
      setIsFavorited(response.data.is_favorited);
    } catch (error) {
      message.error('获取文章详情失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeBlog(Number(id));
        setLikes(prev => prev - 1);
      } else {
        await likeBlog(Number(id));
        setLikes(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleFavorite = async () => {
    try {
      if (isFavorited) {
        await unfavoriteBlog(Number(id));
        setFavorites(prev => prev - 1);
      } else {
        await favoriteBlog(Number(id));
        setFavorites(prev => prev + 1);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      message.error('操作失败');
    }
  };

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
      title: blog?.title || "文章详情",
      path: `/detail/${id}`
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!blog) {
    return null;
  }

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
              {blog.title}
            </div>
            {blog.subtitle && (
              <div className='detail-subtitle'>
                {blog.subtitle}
              </div>
            )}
            <div className='list-icons center'>
              <span className='list-icon'><CalendarOutlined /> {formatDate(blog.created_at)} </span>
              {blog.tags && blog.tags.length > 0 && (
                <span className='list-icon'><BarsOutlined /> {blog.tags.join(', ')} </span>
              )}
              <span className='list-icon'><FireOutlined /> {blog.views_count || 0} </span>
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
                {blog.content}
              </ReactMarkdown>
            </div>
            <InteractionButtons
              initialLikes={likes}
              initialStars={favorites}
              initialComments={blog.comments_count || 0}
              isLiked={isLiked}
              isFavorited={isFavorited}
              onLikeClick={handleLike}
              onStarClick={handleFavorite}
              onCommentClick={() => setShowComments(!showComments)}
            />
            {showComments && <Comments blogId={Number(id)} />}
          </div>
        </Col>
        <Col className='comm-right' xs={0} sm={0} md={7} lg={5} xl={4}>
          {blog.author && (
            <Author
              author={{
                username: blog.author.username,
                avatar: blog.author.avatar,
                bio: blog.author.bio,
                introduction: blog.author.introduction,
                social_links: blog.author.social_links
              }}
            />
          )}
          <div className="toc-container">
            <MarkdownToc content={blog.content} />
          </div>
          <Advert />
        </Col>
      </Row>
    </div>
  );
};

export default Detail;
