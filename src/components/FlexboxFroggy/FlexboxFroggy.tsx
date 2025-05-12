import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, Progress } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import './FlexboxFroggy.css';

const { Title, Text } = Typography;

interface Level {
  id: number;
  description: string;
  css: string;
  html: string;
  solution: string;
}

const FlexboxFroggy: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [css, setCss] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const levels: Level[] = [
    {
      id: 1,
      description: "使用 justify-content 属性将青蛙移动到右侧",
      css: "#pond { display: flex; }",
      html: `<div id="pond">
    <div class="frog"></div>
</div>`,
      solution: "justify-content: flex-end;"
    },
    // 可以添加更多关卡
  ];

  const currentLevelData = levels.find(level => level.id === currentLevel);

  const checkSolution = () => {
    if (currentLevelData && css.trim() === currentLevelData.solution) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
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
          </div>

          <div className="game-playground">
            <div className="code-editor">
              <Text>CSS:</Text>
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder="输入你的 CSS 代码..."
              />
            </div>

            <div className="preview">
              <div className="pond" style={{ display: 'flex' }}>
                <div className="frog"></div>
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

          {showHint && (
            <div className="game-hint">
              <Text type="secondary">提示：{currentLevelData?.solution}</Text>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default FlexboxFroggy; 