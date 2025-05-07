import React, { useEffect, useState, useCallback } from 'react';
import { Anchor, Affix } from 'antd';
import { Link } from 'react-router-dom';
import './index.css';

interface TocItem {
  id: string;
  title: string;
  level: number;
  children: TocItem[];
}

interface AnchorItem {
  key: string;
  href: string;
  title: string;
  children: AnchorItem[];
}

interface MarkdownTocProps {
  content: string;
}

const MarkdownToc: React.FC<MarkdownTocProps> = ({ content }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 计算元素到视口顶部的距离
  const getElementTop = (element: Element): number => {
    const rect = element.getBoundingClientRect();
    return rect.top;
  };

  // 找到当前应该激活的标题
  const findActiveHeading = useCallback(() => {
    const headings = document.querySelectorAll('.detail-content h1, .detail-content h2, .detail-content h3, .detail-content h4');
    let activeHeading: Element | null = null;
    const offset = 50;

    Array.from(headings).some(heading => {
      const top = getElementTop(heading);
      if (top > -offset) {
        activeHeading = heading;
        return true;
      }
      return false;
    });

    if (!activeHeading && headings.length > 0) {
      activeHeading = headings[headings.length - 1];
    }

    return activeHeading?.id || '';
  }, []);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    const newActiveId = findActiveHeading();
    if (newActiveId !== activeId) {
      setActiveId(newActiveId);
    }
  }, [activeId, findActiveHeading]);

  useEffect(() => {
    const headings = document.querySelectorAll('.detail-content h1, .detail-content h2, .detail-content h3, .detail-content h4');
    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      return {
        id,
        title: heading.textContent || '',
        level: parseInt(heading.tagName[1]),
        children: []
      };
    });

    // 构建层级结构
    const buildHierarchy = (items: TocItem[]): TocItem[] => {
      const result: TocItem[] = [];
      const stack: TocItem[] = [];

      items.forEach(item => {
        while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
          stack.pop();
        }

        if (stack.length === 0) {
          result.push(item);
        } else {
          stack[stack.length - 1].children.push(item);
        }
        stack.push(item);
      });

      return result;
    };

    setTocItems(buildHierarchy(items));

    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);
    // 初始化时执行一次
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const convertToAnchorItems = (items: TocItem[]): AnchorItem[] => {
    return items.map(item => ({
      key: item.id,
      href: `#${item.id}`,
      title: item.title,
      children: convertToAnchorItems(item.children)
    }));
  };

  const getTocItems = (content: string) => {
    const headings = content.match(/^#{1,6}\s.+$/gm) || [];
    return headings.map((heading, index) => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const text = heading.replace(/^#+\s/, '');
      return {
        key: `heading-${index}`,
        href: `#${text.toLowerCase().replace(/\s+/g, '-')}`,
        title: text,
        level
      };
    });
  };

  const items = getTocItems(content);

  return (
    <Affix offsetTop={70}>
      <div className="markdown-toc">
        <div className="toc-title">目录</div>
        <Anchor
          items={items.map(item => ({
            key: item.key,
            href: item.href,
            title: item.title,
            children: []
          }))}
        />
      </div>
    </Affix>
  );
};

export default MarkdownToc; 