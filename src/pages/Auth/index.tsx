import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginResponse } from '../../services/api';
import { setToken, removeToken } from '../../utils/auth';
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
  verificationCode: string;
}

interface ForgotPasswordForm {
  email: string;
}

interface ResetPasswordForm {
  token: string;
  new_password: string;
  confirm_password: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [registerForm] = Form.useForm();
  const navigate = useNavigate();

  // 发送验证码
  const handleSendVerificationCode = async (email: string) => {
    try {
      await authApi.sendVerificationCode({ email });
      message.success('验证码已发送');
      setVerificationCodeSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发送验证码失败');
    }
  };

  const onLoginFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      const { access_token, user } = response as LoginResponse;

      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');

      const token = access_token.trim();
      if (!token) {
        throw new Error('获取到的 token 无效');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(user));

      message.success('登录成功');
      navigate('/', { replace: true });
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
      // 先验证验证码
      await authApi.verifyCode({
        email: values.email,
        code: values.verificationCode
      });

      // 验证码正确后注册
      await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      message.success('注册成功，请登录');
      setIsLogin(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败，请稍后重试';
      if (errorMessage.includes('密码必须包含')) {
        message.error('密码要求：' + errorMessage.split('密码必须包含')[1]);
      } else {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const onForgotPasswordFinish = async (values: ForgotPasswordForm) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values);
      message.success('重置密码邮件已发送，请查收');
      setIsForgotPassword(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发送重置密码邮件失败');
    } finally {
      setLoading(false);
    }
  };

  const onResetPasswordFinish = async (values: ResetPasswordForm) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        token: values.token,
        new_password: values.new_password
      });
      message.success('密码重置成功，请登录');
      setIsResetPassword(false);
      setIsLogin(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '重置密码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('userInfo');
    message.success('已退出登录');
    navigate('/auth');
  };

  if (isForgotPassword) {
    return (
      <div className="auth-container">
        <div className="form-container">
          <Form
            name="forgot-password"
            onFinish={onForgotPasswordFinish}
            autoComplete="off"
          >
            <h2>忘记密码</h2>
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                发送重置密码邮件
              </Button>
            </Form.Item>

            <Button
              type="link"
              onClick={() => setIsForgotPassword(false)}
            >
              返回登录
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  if (isResetPassword) {
    return (
      <div className="auth-container">
        <div className="form-container">
          <Form
            name="reset-password"
            onFinish={onResetPasswordFinish}
            autoComplete="off"
          >
            <h2>重置密码</h2>
            <Form.Item
              name="token"
              rules={[{ required: true, message: '请输入重置密码token' }]}
            >
              <Input
                prefix={<LockOutlined />}
                placeholder="重置密码token"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="new_password"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="新密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认新密码"
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
                重置密码
              </Button>
            </Form.Item>

            <Button
              type="link"
              onClick={() => setIsResetPassword(false)}
            >
              返回登录
            </Button>
          </Form>
        </div>
      </div>
    );
  }

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

            <Button
              type="link"
              onClick={() => setIsForgotPassword(true)}
            >
              忘记密码？
            </Button>
          </Form>
        </div>

        <div className="form-container sign-up-container">
          <Form
            form={registerForm}
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
              name="verificationCode"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="验证码"
                size="large"
                suffix={
                  <Button
                    type="link"
                    disabled={countdown > 0}
                    onClick={() => {
                      const email = registerForm.getFieldValue('email');
                      if (email) {
                        handleSendVerificationCode(email);
                      } else {
                        message.error('请先输入邮箱');
                      }
                    }}
                  >
                    {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                  </Button>
                }
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