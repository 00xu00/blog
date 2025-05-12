import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, Progress, message } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './FlexboxFroggy.css';

const { Title, Text } = Typography;

interface Level {
  id: number;
  description: string;
  css: string;
  html: string;
  solution: string;
  hint?: string;
}

const FlexboxFroggy: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [css, setCss] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [cssError, setCssError] = useState<string | null>(null);

  const levels: Level[] = [
    {
      id: 1,
      description: "使用 justify-content 属性将青蛙移动到右侧",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
</div>`,
      solution: "justify-content: flex-end;",
      hint: "justify-content 属性用于在主轴（水平方向）上对齐元素"
    },
    {
      id: 2,
      description: "使用 justify-content 属性将青蛙移动到中间",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
</div>`,
      solution: "justify-content: center;",
      hint: "center 值会将元素居中显示"
    },
    {
      id: 3,
      description: "使用 justify-content 属性让青蛙均匀分布",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
    <div class="frog"></div>
    <div class="frog"></div>
</div>`,
      solution: "justify-content: space-between;",
      hint: "space-between 会在元素之间创建相等的间距"
    },
    {
      id: 4,
      description: "使用 align-items 属性将青蛙移动到顶部",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
</div>`,
      solution: "align-items: flex-start;",
      hint: "align-items 属性用于在交叉轴（垂直方向）上对齐元素"
    },
    {
      id: 5,
      description: "使用 flex-direction 属性让青蛙垂直排列",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
    <div class="frog"></div>
</div>`,
      solution: "flex-direction: column;",
      hint: "flex-direction 属性可以改变主轴的方向"
    },
    {
      id: 6,
      description: "使用 flex-wrap 属性让青蛙换行显示",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
    <div class="frog"></div>
    <div class="frog"></div>
    <div class="frog"></div>
    <div class="frog"></div>
</div>`,
      solution: "flex-wrap: wrap;",
      hint: "flex-wrap 属性允许元素在需要时换行"
    },
    {
      id: 7,
      description: "使用 flex 属性让中间的青蛙占据更多空间",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
    <div class="frog"></div>
    <div class="frog"></div>
</div>`,
      solution: "#pond .frog:nth-child(2) { flex: 2; }",
      hint: "flex 属性是 flex-grow、flex-shrink 和 flex-basis 的简写"
    },
    {
      id: 8,
      description: "使用 order 属性改变青蛙的显示顺序",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
    <div class="frog"></div>
    <div class="frog"></div>
</div>`,
      solution: "#pond .frog:nth-child(3) { order: -1; }",
      hint: "order 属性可以改变元素的显示顺序"
    }
  ];

  const currentLevelData = levels.find(level => level.id === currentLevel);

  const handleCssChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setCss(inputValue);
    setCssError(null);

    // 尝试解析 CSS
    try {
      if (inputValue.trim()) {
        const [property, cssValue] = inputValue.split(':').map((s: string) => s.trim());
        if (!property || !cssValue) {
          throw new Error('CSS 格式不正确，请使用 "属性: 值" 的格式');
        }
        // 检查是否是有效的 CSS 属性
        const validProperties = [
          'justify-content',
          'align-items',
          'flex-direction',
          'flex-wrap',
          'flex',
          'order'
        ];
        if (!validProperties.includes(property)) {
          throw new Error(`不支持的 CSS 属性: ${property}`);
        }
      }
    } catch (error) {
      setCssError(error instanceof Error ? error.message : 'CSS 代码有误');
    }
  };

  const getPreviewStyle = () => {
    try {
      if (!css.trim()) return { display: 'flex' };

      const [property, cssValue] = css.split(':').map((s: string) => s.trim());
      if (!property || !cssValue) return { display: 'flex' };

      return {
        display: 'flex',
        [property]: cssValue
      };
    } catch (error) {
      return { display: 'flex' };
    }
  };

  const checkSolution = () => {
    if (cssError) {
      message.error('请先修正 CSS 代码错误');
      return;
    }

    if (currentLevelData && css.trim() === currentLevelData.solution) {
      setIsCorrect(true);
      message.success('恭喜你，答案正确！');
    } else {
      setIsCorrect(false);
      message.error('答案不正确，请再试一次');
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length) {
      setCurrentLevel(currentLevel + 1);
      setCss('');
      setIsCorrect(false);
      setShowHint(false);
    }
  };

  const previousLevel = () => {
    if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1);
      setCss('');
      setIsCorrect(false);
      setShowHint(false);
    }
  };

  const resetLevel = () => {
    setCss('');
    setIsCorrect(false);
    setShowHint(false);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className="flexbox-froggy-container">
      <Card className="game-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="game-header">
            <Title level={3}>Flexbox Froggy</Title>
            <Progress
              percent={Math.round((currentLevel / levels.length) * 100)}
              size="small"
              status="active"
            />
          </div>

          <div className="game-description">
            <Text>{currentLevelData?.description}</Text>
            <Button
              type="link"
              icon={<QuestionCircleOutlined />}
              onClick={toggleHint}
              className="hint-button"
            >
              提示
            </Button>
          </div>

          <div className="game-playground">
            <div className="code-editor">
              <Text>CSS:</Text>
              <textarea
                value={css}
                onChange={handleCssChange}
                placeholder="输入你的 CSS 代码..."
                style={{ width: '95%' }}
                className={cssError ? 'error' : ''}
              />
              {cssError && (
                <div className="css-error-message">
                  <Text type="danger">{cssError}</Text>
                </div>
              )}
            </div>

            <div className="preview">
              <div
                className="pond"
                style={getPreviewStyle()}
              >
                <div className="frog"></div>
                {currentLevelData?.html.includes('frog') &&
                  Array.from({ length: currentLevelData.html.match(/frog/g)?.length || 1 - 1 }).map((_, i) => (
                    <div key={i} className="frog"></div>
                  ))
                }
              </div>
            </div>
          </div>

          <div className="game-controls">
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={previousLevel}
                disabled={currentLevel === 1}
              >
                上一关
              </Button>
              <Button
                type="primary"
                onClick={checkSolution}
                disabled={!!cssError}
              >
                检查
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetLevel}
              >
                重置
              </Button>
              <Button
                icon={<ArrowRightOutlined />}
                onClick={nextLevel}
                disabled={currentLevel === levels.length || !isCorrect}
              >
                下一关
              </Button>
            </Space>
          </div>

          {showHint && currentLevelData?.hint && (
            <div className="game-hint">
              <Text type="secondary">{currentLevelData.hint}</Text>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default FlexboxFroggy; 