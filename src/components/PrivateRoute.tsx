import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');

      if (token && userInfo) {
        try {
          // 验证 userInfo 是否是有效的 JSON
          JSON.parse(userInfo);
          setIsAuthenticated(true);
        } catch (e) {
          // 如果 userInfo 不是有效的 JSON，清除无效数据
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

  if (isLoading) {
    return null; // 或者返回一个加载指示器
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 