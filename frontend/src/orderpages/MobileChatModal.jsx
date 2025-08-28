import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Image,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Loader2,
  AlertCircle,
  Check,
  CheckCheck,
  ArrowLeft,
  Menu
} from 'lucide-react';
import io from 'socket.io-client';

const MobileChatModal = ({ isOpen, onClose, product, userInfo }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && !socket) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('user-join', {
          userId: userInfo.id,
          userType: userInfo.type || 'wholeseller',
          userName: userInfo.name
        });
      });

      newSocket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      newSocket.on('user-typing', (data) => {
        if (data.userId !== userInfo.id) {
          setIsTyping(data.isTyping);
          setTypingUser(data.userName);
          
          if (data.isTyping) {
            setTimeout(() => {
              setIsTyping(false);
              setTypingUser('');
            }, 3000);
          }
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, userInfo]);

  // Initialize chat room
  useEffect(() => {
    if (isOpen && product && userInfo) {
      initializeChatRoom();
    }
  }, [isOpen, product, userInfo]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChatRoom = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/chat/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product._id,
          userId: userInfo.id,
          userType: userInfo.type || 'wholeseller',
          userName: userInfo.name,
          userEmail: userInfo.email
        })
      });

      const data = await response.json();

      if (data.success) {
        setChatRoom(data.chatRoom);
        if (socket) {
          socket.emit('join-chat', data.chatRoom._id);
        }
        await loadMessages(data.chatRoom._id);
      } else {
        setError(data.message || 'Failed to initialize chat');
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to connect to chat service');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/${chatRoomId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatRoom || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    if (socket) {
      socket.emit('typing-stop', {
        chatRoomId: chatRoom._id,
        userId: userInfo.id,
        userName: userInfo.name
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatRoomId: chatRoom._id,
          senderId: userInfo.id,
          senderType: userInfo.type || 'wholeseller',
          senderName: userInfo.name,
          content: messageContent
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to send message');
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      sendImageMessage(file);
    } else {
      setError('Image size should be less than 5MB');
    }
  };

  const sendImageMessage = async (imageFile) => {
    if (!chatRoom || sending) return;

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('chatRoomId', chatRoom._id);
      formData.append('senderId', userInfo.id);
      formData.append('senderType', userInfo.type || 'wholeseller');
      formData.append('senderName', userInfo.name);
      formData.append('caption', '');

      const response = await fetch(`${API_BASE_URL}/chat/message/image`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to send image');
      }
    } catch (error) {
      console.error('Error sending image:', error);
      setError('Failed to send image');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && chatRoom) {
      socket.emit('typing-start', {
        chatRoomId: chatRoom._id,
        userId: userInfo.id,
        userName: userInfo.name
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', {
          chatRoomId: chatRoom._id,
          userId: userInfo.id,
          userName: userInfo.name
        });
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isMyMessage = (message) => {
    return message.sender.userId === userInfo.id;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={product?.images?.[0] || '/api/placeholder/32/32'}
            alt={product?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{product?.manufacturer}</h3>
            <p className="text-xs opacity-90 truncate">{product?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-blue-700 rounded-full">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-blue-700 rounded-full">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-blue-700 rounded-full">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3 flex items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-red-700 text-sm flex-1">{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[280px] px-3 py-2 rounded-2xl ${
                    isMyMessage(message)
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-sm border rounded-bl-md'
                  }`}
                >
                  {message.messageType === 'image' ? (
                    <div>
                      <img
                        src={`${API_BASE_URL}${message.imageUrl}`}
                        alt="Shared image"
                        className="rounded-lg mb-1 max-w-full h-auto"
                        onClick={() => window.open(`${API_BASE_URL}${message.imageUrl}`, '_blank')}
                      />
                      {message.content && message.content !== 'Image' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                    isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {isMyMessage(message) && (
                      <div className="flex">
                        {message.isRead ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-sm border">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{typingUser} is typing</span>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input - Mobile Optimized */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-end space-x-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Image className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-2 max-h-20 min-h-[40px] resize-none border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending || loading}
              rows="1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || sending || loading}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default MobileChatModal;