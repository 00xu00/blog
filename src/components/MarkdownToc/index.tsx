import React, { useEffect, useState, useCallback } from 'react';
import { Anchor, Affix } from 'antd';
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
  const headerHeight = 70; // header的高度

  // 找到当前应该激活的标题
  const findActiveHeading = useCallback(() => {
    const headings = document.querySelectorAll('.detail-content h1, .detail-content h2, .detail-content h3, .detail-content h4');
    const scrollPosition = window.scrollY + headerHeight + 20; // 添加一个小的偏移量

    // 找到第一个位置大于滚动位置的标题的前一个标题
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const nextHeading = headings[i + 1];
      const headingTop = heading.getBoundingClientRect().top + window.scrollY;

      if (nextHeading) {
        const nextHeadingTop = nextHeading.getBoundingClientRect().top + window.scrollY;
        if (scrollPosition >= headingTop && scrollPosition < nextHeadingTop) {
          return heading.id;
        }
      } else {
        // 如果是最后一个标题
        if (scrollPosition >= headingTop) {
          return heading.id;
        }
      }
    }

    // 如果滚动位置在第一个标题之前，返回第一个标题
    return headings[0]?.id || '';
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
  }, [handleScroll, content]);

  const convertToAnchorItems = (items: TocItem[]): AnchorItem[] => {
    return items.map(item => ({
      key: item.id,
      href: `#${item.id}`,
      title: item.title,
      children: convertToAnchorItems(item.children)
    }));
  };

  return (
    <Affix offsetTop={headerHeight}>
      <div className="markdown-toc">
        <div className="toc-title">目录</div>
        <Anchor
          items={convertToAnchorItems(tocItems)}
          affix={false}
          offsetTop={headerHeight}
          targetOffset={headerHeight}
          getCurrentAnchor={() => `#${activeId}`}
        />
      </div>
    </Affix>
  );
};

export default MarkdownToc; 