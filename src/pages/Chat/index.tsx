import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Avatar, Button, Input, message, Space } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { Message as MessageType, createMessage, getConversation, markMessageAsRead } from '../../api/message';
import './index.css';

const Chat: React.FC = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatUser, setChatUser] = useState<{ id: number; name: string; avatar: string | null }>({
    id: 0,
    name: '',
    avatar: null
  });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 获取当前用户ID
  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 如果有location.state，自动设置聊天对象
    if (location.state && location.state.userId) {
      setChatUser({
        id: Number(location.state.userId),
        name: location.state.username || `用户${location.state.userId}`,
        avatar: location.state.avatar || null
      });
      loadMessages(Number(location.state.userId));
    }
  }, [location.state]);

  // 加载消息
  const loadMessages = async (userId: number) => {
    try {
      const response = await getConversation(userId);
      setMessages(response);
      // 标记未读消息为已读
      response.forEach((msg: MessageType) => {
        if (!msg.is_read && msg.sender_id === userId) {
          markMessageAsRead(msg.id);
        }
      });
      scrollToBottom();
    } catch (error) {
      console.error('加载消息失败:', error);
      message.error('加载消息失败');
    }
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || !chatUser.id) {
      message.warning('请输入消息内容');
      return;
    }

    try {
      const newMessage = await createMessage(chatUser.id, inputValue);
      setMessages([...messages, newMessage]);
      setInputValue('');
      scrollToBottom();
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Space>
          <Avatar
            src={chatUser.avatar}
            icon={<UserOutlined />}
            size={40}
            style={{ backgroundColor: '#1890ff' }}
          />
          <span className="chat-header-username">{chatUser.name}</span>
        </Space>
      </div>
      <div className="chat-messages">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message-item ${message.sender_id === currentUserId ? 'self' : 'other'}`}
            style={{ backgroundColor: '#f5f5f5' }}
          >
            <div className="message-avatar">
              <Avatar
                src={message.sender.avatar}
                icon={<UserOutlined />}
                size={36}
                style={{ backgroundColor: '#1890ff' }}
              />
            </div>
            <div className="message-content">
              <div className="message-info">
                <span className="message-name">{message.sender.username}</span>
                <span className="message-time">{new Date(message.created_at).toLocaleString()}</span>
              </div>
              <div className="message-text">{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <Input.TextArea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="输入消息..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          className="send-button"
        />
      </div>
    </div>
  );
};

export default Chat; 