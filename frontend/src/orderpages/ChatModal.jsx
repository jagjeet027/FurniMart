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
  CheckCheck
} from 'lucide-react';
import io from 'socket.io-client';

const FixedChatModal = ({ isOpen, onClose, product, userInfo }) => {
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
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && !socket) {
      console.log('Connecting to socket server...');
      const newSocket = io(SOCKET_URL, {
        forceNew: true,
        timeout: 5000,
        transports: ['websocket']
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('user-join', {
          userId: userInfo.id,
          userType: userInfo.type || 'wholeseller',
          userName: userInfo.name
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Failed to connect to chat server');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
      });

      // Listen for new messages
      newSocket.on('new-message', (message) => {
        console.log('Received new message:', message);
        if (chatRoom && message.chatRoom === chatRoom._id) {
          setMessages(prev => {
            // Avoid duplicate messages
            const exists = prev.find(msg => msg._id === message._id);
            if (exists) return prev;
            return [...prev, message];
          });
          scrollToBottom();
        }
      });

      // Listen for typing events
      newSocket.on('user-typing', (data) => {
        if (data.userId !== userInfo.id && chatRoom && data.chatRoomId === chatRoom._id) {
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
    }

    return () => {
      if (socket) {
        console.log('Disconnecting socket...');
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isOpen, userInfo, chatRoom]);

  // Initialize chat room
  useEffect(() => {
    if (isOpen && product && userInfo) {
      initializeChatRoom();
    }
  }, [isOpen, product, userInfo]);

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
      console.log('Initializing chat room for product:', product);

      const requestBody = {
        productId: product._id || product.id,
        userId: userInfo.id,
        userType: userInfo.type || 'wholeseller',
        userName: userInfo.name,
        userEmail: userInfo.email,
        // ADD THESE IMPORTANT FIELDS
        productName: product.name,
        manufacturerId: product.manufacturer?._id || product.manufacturerId,
        manufacturerName: product.manufacturer?.name || product.manufacturerName
      };

      console.log('Chat room request:', requestBody);

      const response = await fetch(`${API_BASE_URL}/chat/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat room response:', data);

      if (data.success) {
        setChatRoom(data.chatRoom);
        
        // Join the chat room via socket
        if (socket) {
          console.log('Joining chat room:', data.chatRoom._id);
          socket.emit('join-chat', data.chatRoom._id);
        }
        
        // Load existing messages
        await loadMessages(data.chatRoom._id);
      } else {
        throw new Error(data.message || 'Failed to initialize chat');
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError(`Failed to initialize chat: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId) => {
    try {
      console.log('Loading messages for room:', chatRoomId);
      const response = await fetch(`${API_BASE_URL}/chat/messages/${chatRoomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Messages loaded:', data);

      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
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
      console.log('Sending message:', messageContent);

      const messageData = {
        chatRoomId: chatRoom._id,
        senderId: userInfo.id,
        senderType: userInfo.type || 'wholeseller',
        senderName: userInfo.name,
        content: messageContent,
        // ADD THESE FOR MANUFACTURER NOTIFICATION
        manufacturerId: product.manufacturer?._id || product.manufacturerId,
        productName: product.name
      };

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Message sent:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Emit via socket for real-time delivery
      if (socket) {
        socket.emit('new-message', {
          ...messageData,
          _id: data.message._id,
          createdAt: data.message.createdAt,
          sender: {
            userId: userInfo.id,
            name: userInfo.name
          }
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error.message}`);
      setNewMessage(messageContent);
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
        if (socket) {
          socket.emit('typing-stop', {
            chatRoomId: chatRoom._id,
            userId: userInfo.id,
            userName: userInfo.name
          });
        }
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
    return message.sender?.userId === userInfo.id;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold">
              {(product?.manufacturer?.name || product?.manufacturerName || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {product?.manufacturer?.name || product?.manufacturerName || 'Manufacturer'}
              </h3>
              <p className="text-xs opacity-90">{product?.name || 'Product Chat'}</p>
              {socket?.connected && (
                <p className="text-xs opacity-75">● Connected</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-blue-700 rounded-full">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-blue-700 rounded-full">
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 mx-4 mt-2 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-700 text-sm flex-1">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Connecting to chat...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 border-2 border-blue-200">
                      <span className="text-2xl font-semibold text-blue-600">
                        {(product?.manufacturer?.name || product?.manufacturerName || 'M').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-700">
                      {product?.manufacturer?.name || product?.manufacturerName || 'Manufacturer'}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">{product?.name || 'Product'}</p>
                    <p className="text-xs text-gray-400">Start a conversation about this product</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      isMyMessage(message) 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      {!isMyMessage(message) && (
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          {message.sender?.name || 'Manufacturer'}
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        isMyMessage(message) ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(message.createdAt)}</span>
                        {isMyMessage(message) && (
                          <div>
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
                ))
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-600">{typingUser} is typing</div>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t p-4 bg-white">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending || loading}
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || loading}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedChatModal;