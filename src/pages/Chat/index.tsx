import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Input, Button, Space, message } from 'antd';
import { UserOutlined, SendOutlined } from '@ant-design/icons';
import './index.css';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createTime: string;
  isRead: boolean;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 模拟获取聊天记录
    const mockMessages: Message[] = [
      {
        id: '1',
        sender: {
          id: '2',
          name: '用户A',
          avatar: ''
        },
        content: '你好，请问这篇文章的代码可以分享一下吗？',
        createTime: '2024-01-01 12:00',
        isRead: true
      },
      {
        id: '2',
        sender: {
          id: '1',
          name: '我',
          avatar: ''
        },
        content: '当然可以，这是代码链接：https://github.com/example',
        createTime: '2024-01-01 12:05',
        isRead: true
      },
      {
        id: '3',
        sender: {
          id: '2',
          name: '用户A',
          avatar: ''
        },
        content: '感谢你的分享，对我帮助很大！',
        createTime: '2024-01-01 12:10',
        isRead: true
      }
    ];
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    // 滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: {
        id: '1',
        name: '我',
        avatar: ''
      },
      content: inputValue,
      createTime: new Date().toLocaleString(),
      isRead: true
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Space>
          <Avatar src="" icon={<UserOutlined />} />
          <span>用户A</span>
        </Space>
      </div>
      <div className="chat-messages">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message-item ${message.sender.id === '1' ? 'self' : 'other'}`}
          >
            <div className="message-avatar">
              <Avatar src={message.sender.avatar} icon={<UserOutlined />} />
            </div>
            <div className="message-content">
              <div className="message-info">
                <span className="message-name">{message.sender.name}</span>
                <span className="message-time">{message.createTime}</span>
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