import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import './index.css';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onLoginFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userInfo', JSON.stringify(response.user));
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      message.success('注册成功，请登录');
      setIsLogin(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`container ${!isLogin ? 'right-panel-active' : ''}`}>
        <div className="form-container sign-in-container">
          <Form
            name="login"
            onFinish={onLoginFinish}
            autoComplete="off"
          >
            <h2>登录</h2>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="邮箱"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className="form-container sign-up-container">
          <Form
            name="register"
            onFinish={onRegisterFinish}
            autoComplete="off"
          >
            <h2>注册</h2>
            <Form.Item
              name="name"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="邮箱"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>欢迎回来！</h2>
              <p>如果需要和其他人或与本人联系，请使用您正确的个人信息登录，谢谢！</p>
              <Button
                type="default"
                className="ghost"
                onClick={() => setIsLogin(true)}
              >
                登录
              </Button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>你好，朋友！</h2>
              <p>输入您的个人信息并与我们一起开始旅程！</p>
              <Button
                type="default"
                className="ghost"
                onClick={() => setIsLogin(false)}
              >
                注册
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 