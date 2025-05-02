import React, { useState } from 'react';
import './logo.css';

interface LogoProps {
  className?: string;
  mainText?: string;
  subText?: string;
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark';
  showParticles?: boolean;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  mainText = '曦景',
  subText = '博客',
  size = 'medium',
  theme = 'light',
  showParticles = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`logo-container ${className} ${size} ${theme}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="logo-wrapper">
        <span className="logo-text">{mainText}</span>
        {showParticles && (
          <div className="logo-particles">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`} />
            ))}
          </div>
        )}
      </div>
      {subText && <span className="logo-subtext">{subText}</span>}
    </div>
  );
};

export default Logo;
