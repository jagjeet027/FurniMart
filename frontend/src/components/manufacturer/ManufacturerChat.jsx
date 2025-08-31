import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Search,
  User,
  Clock,
  Check,
  CheckCheck,
  Image,
  Phone,
  Video,
  MoreVertical,
  Loader2,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import io from 'socket.io-client';

const ManufacturerChat = ({ manufacturerInfo }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  // Get manufacturer identifier with better fallback logic
  const getManufacturerIdentifier = () => {
    if (!manufacturerInfo) return null;
    
    console.log('Manufacturer Info:', manufacturerInfo);
    
    return manufacturerInfo.id || 
           manufacturerInfo._id || 
           manufacturerInfo.manufacturerId ||
           manufacturerInfo.name || 
           manufacturerInfo.businessName || 
           manufacturerInfo.manufacturerName ||
           manufacturerInfo.email ||
           null;
  };

  const manufacturerId = getManufacturerIdentifier();

  // Initialize socket connection
  useEffect(() => {
    let socketInstance = null;

    const connectSocket = () => {
      if (manufacturerId && !socketInstance) {
        console.log('Connecting manufacturer to socket...', manufacturerId);
        setConnectionStatus('connecting');

        socketInstance = io(SOCKET_URL, {
          forceNew: true,
          timeout: 10000,
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        socketInstance.on('connect', () => {
          console.log('Manufacturer connected to socket');
          setConnectionStatus('connected');
          setError('');
          
          socketInstance.emit('user-join', {
            userId: manufacturerId,
            userType: 'manufacturer',
            userName: manufacturerInfo?.name || manufacturerInfo?.businessName || 'Manufacturer'
          });
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setConnectionStatus('error');
          setError('Connection failed. Retrying...');
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (socketInstance && socketInstance.connected === false) {
              socketInstance.connect();
            }
          }, 5000);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          setConnectionStatus('disconnected');
        });

        // Listen for new messages
        socketInstance.on('new-message', (messageData) => {
          try {
            console.log('New message received:', messageData);
            
            updateChatRoomsList();
            
            if (selectedChat && 
                (messageData.chatRoomId === selectedChat._id || 
                 messageData.chatRoom === selectedChat._id)) {
              
              setMessages(prev => {
                const exists = prev.find(msg => 
                  msg._id === messageData._id || 
                  msg._id === messageData.message?._id
                );
                if (exists) return prev;
                
                const newMsg = messageData.message || messageData;
                return [...prev, newMsg];
              });
              
              scrollToBottom();
              
              if (messageData.sender?.userId !== manufacturerId) {
                setTimeout(() => markMessagesAsRead(selectedChat._id), 500);
              }
            }
          } catch (error) {
            console.error('Error handling new message:', error);
          }
        });

        socketInstance.on('new-chat-message', (data) => {
          try {
            console.log('New chat message received:', data);
            updateChatRoomsList();
            
            if (selectedChat && selectedChat._id === data.chatRoomId) {
              setMessages(prev => {
                const exists = prev.find(msg => msg._id === data.message._id);
                if (exists) return prev;
                return [...prev, data.message];
              });
              scrollToBottom();
            }
          } catch (error) {
            console.error('Error handling new chat message:', error);
          }
        });

        // Message status updates
        socketInstance.on('message-delivered', (data) => {
          setMessages(prev => prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, deliveryStatus: 'delivered' }
              : msg
          ));
        });

        socketInstance.on('messages-read', (data) => {
          setMessages(prev => prev.map(msg => 
            msg.sender?.userId !== manufacturerId 
              ? { ...msg, deliveryStatus: 'read' }
              : msg
          ));
        });

        // Typing indicators
        socketInstance.on('typing-start', (data) => {
          if (selectedChat && data.chatRoomId === selectedChat._id && data.userId !== manufacturerId) {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              newMap.set(data.userId, data.userName);
              return newMap;
            });
          }
        });

        socketInstance.on('typing-stop', (data) => {
          if (selectedChat && data.chatRoomId === selectedChat._id) {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              newMap.delete(data.userId);
              return newMap;
            });
          }
        });

        socketInstance.on('user-typing', (data) => {
          if (selectedChat && data.chatRoomId === selectedChat._id && data.userId !== manufacturerId) {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              if (data.isTyping) {
                newMap.set(data.userId, data.userName);
              } else {
                newMap.delete(data.userId);
              }
              return newMap;
            });
          }
        });

        // Online/offline status
        socketInstance.on('user-online', (user) => {
          setOnlineUsers(prev => new Set(prev).add(user.userId));
        });

        socketInstance.on('user-offline', (user) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(user.userId);
            return newSet;
          });
        });

        setSocket(socketInstance);
      }
    };

    connectSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socketInstance) {
        console.log('Cleaning up socket connection');
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
        socketInstance = null;
      }
      setSocket(null);
      setConnectionStatus('disconnected');
    };
  }, [manufacturerId, selectedChat]);

  // Load manufacturer chat rooms
  useEffect(() => {
    if (manufacturerId) {
      loadChatRooms();
    }
  }, [manufacturerId]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const updateChatRoomsList = async () => {
    try {
      console.log('Updating chat rooms for manufacturer:', manufacturerId);
      const response = await fetch(`${API_BASE_URL}/chat/manufacturer/${encodeURIComponent(manufacturerId)}/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatRooms(data.chatRooms);
        } else {
          console.error('Failed to update chat rooms:', data.message);
        }
      } else {
        console.error('HTTP error updating chat rooms:', response.status);
      }
    } catch (error) {
      console.error('Error updating chat rooms:', error);
    }
  };

  const loadChatRooms = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading chat rooms for manufacturer:', manufacturerId);
      const response = await fetch(`${API_BASE_URL}/chat/manufacturer/${encodeURIComponent(manufacturerId)}/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Chat rooms loaded:', data);
        if (data.success) {
          setChatRooms(data.chatRooms);
        } else {
          setError(data.message || 'Failed to load chat rooms');
        }
      } else {
        setError(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId) => {
    try {
      console.log('Loading messages for chat room:', chatRoomId);
      const response = await fetch(`${API_BASE_URL}/chat/messages/${chatRoomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Messages loaded:', data);
        if (data.success) {
          setMessages(data.messages || []);
          await markMessagesAsRead(chatRoomId);
        } else {
          setError('Failed to load messages');
        }
      } else {
        setError(`Failed to load messages: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const markMessagesAsRead = async (chatRoomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          chatRoomId,
          userId: manufacturerId
        })
      });

      if (response.ok && socket && socket.connected) {
        socket.emit('messages-read-bulk', {
          chatRoomId,
          userId: manufacturerId
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleChatSelect = async (chatRoom) => {
    console.log('Selecting chat room:', chatRoom);
    setSelectedChat(chatRoom);
    setMessages([]);
    setError('');
    
    if (socket && socket.connected) {
      if (selectedChat) {
        socket.emit('leave-chat', selectedChat._id);
      }
      socket.emit('join-chat', chatRoom._id);
    }
    
    await loadMessages(chatRoom._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    if (socket && socket.connected) {
      socket.emit('typing-stop', {
        chatRoomId: selectedChat._id,
        userId: manufacturerId,
        userName: manufacturerInfo?.name || manufacturerInfo?.businessName || 'Manufacturer'
      });
    }

    try {
      console.log('Sending message from manufacturer:', manufacturerId);
      const messageData = {
        chatRoomId: selectedChat._id,
        senderId: manufacturerId,
        senderType: 'manufacturer',
        senderName: manufacturerInfo?.name || manufacturerInfo?.businessName || 'Manufacturer',
        content: messageContent
      };

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Message sent successfully:', data);
        if (data.success) {
          setMessages(prev => {
            const exists = prev.find(msg => msg._id === data.message._id);
            if (exists) return prev;
            return [...prev, data.message];
          });
          
          scrollToBottom();
          
          if (socket && socket.connected) {
            socket.emit('new-message', {
              ...data.message,
              chatRoomId: selectedChat._id,
              chatRoom: selectedChat._id
            });
          }
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      } else {
        throw new Error(`Server error: ${response.status}`);
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
    if (socket && socket.connected && selectedChat) {
      socket.emit('typing-start', {
        chatRoomId: selectedChat._id,
        userId: manufacturerId,
        userName: manufacturerInfo?.name || manufacturerInfo?.businessName || 'Manufacturer'
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socket && socket.connected) {
          socket.emit('typing-stop', {
            chatRoomId: selectedChat._id,
            userId: manufacturerId,
            userName: manufacturerInfo?.name || manufacturerInfo?.businessName || 'Manufacturer'
          });
        }
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return '';
    }
  };

  const getUnreadCount = (chatRoom) => {
    try {
      if (typeof chatRoom.unreadCount === 'number') {
        return chatRoom.unreadCount;
      }
      return chatRoom.unreadCount?.[manufacturerId] || 0;
    } catch (error) {
      return 0;
    }
  };

  const isMyMessage = (message) => {
    return message.sender?.userId === manufacturerId ||
           message.senderId === manufacturerId ||
           message.senderType === 'manufacturer';
  };

  const getDeliveryStatusIcon = (message) => {
    if (!isMyMessage(message)) return null;
    
    switch (message.deliveryStatus) {
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const filteredChatRooms = chatRooms.filter(room => 
    room.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.participants?.some(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getCurrentUserName = (chatRoom) => {
    const user = chatRoom.participants?.find(p => p.userType !== 'manufacturer');
    return user?.name || 'Customer';
  };

  const isUserOnline = (chatRoom) => {
    const user = chatRoom.participants?.find(p => p.userType !== 'manufacturer');
    return user ? onlineUsers.has(user.userId) : false;
  };

  if (!manufacturerInfo || !manufacturerId) {
    return (
      <div className="flex h-full bg-gray-50 items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Manufacturer Information Required</h3>
          <p>Please provide manufacturer information to access chat.</p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-left max-w-md">
            <strong>Current manufacturer info:</strong>
            <pre>{JSON.stringify(manufacturerInfo, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Customer Chats</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`} title={`Connection: ${connectionStatus}`}></div>
              
              <button
                onClick={loadChatRooms}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 my-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-red-700 text-sm flex-1">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Debug Info */}
        <div className="mx-4 my-2 p-2 bg-gray-100 rounded text-xs">
          <div><strong>Manufacturer ID:</strong> {manufacturerId}</div>
          <div><strong>Chat Rooms:</strong> {chatRooms.length}</div>
          <div><strong>Selected:</strong> {selectedChat?._id || 'None'}</div>
          <div><strong>Messages:</strong> {messages.length}</div>
          <div><strong>Connection:</strong> {connectionStatus}</div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : filteredChatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <MessageCircle className="w-8 h-8 mb-2" />
              <p className="text-sm">No chat requests yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Manufacturer: {manufacturerInfo?.name || manufacturerInfo?.businessName || manufacturerId}
              </p>
            </div>
          ) : (
            filteredChatRooms.map((chatRoom) => {
              const userName = getCurrentUserName(chatRoom);
              const unreadCount = getUnreadCount(chatRoom);
              const userOnline = isUserOnline(chatRoom);

              return (
                <div
                  key={chatRoom._id}
                  onClick={() => handleChatSelect(chatRoom)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?._id === chatRoom._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        {userOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {userName}
                          </h3>
                          {chatRoom.lastMessage?.timestamp && (
                            <span className="text-xs text-gray-500">
                              {formatTime(chatRoom.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {chatRoom.productName}
                        </p>
                        
                        {chatRoom.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {chatRoom.lastMessage.sender === 'Manufacturer' ? 'You: ' : ''}
                            {chatRoom.lastMessage.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  {isUserOnline(selectedChat) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getCurrentUserName(selectedChat)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedChat.productName}
                  </p>
                  {isUserOnline(selectedChat) && (
                    <p className="text-xs text-green-600">Online</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Start a conversation</p>
                    <p className="text-xs text-gray-400 mt-1">Room ID: {selectedChat._id}</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const showDate = index === 0 || 
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={message._id || `msg-${index}`}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            isMyMessage(message)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}>
                            {!isMyMessage(message) && (
                              <div className="text-xs font-medium text-gray-600 mb-1">
                                {message.sender?.name || message.senderName || 'Customer'}
                              </div>
                            )}
                            
                            {message.messageType === 'image' && message.imageUrl && (
                              <div className="mb-2">
                                <img
                                  src={`${API_BASE_URL.replace('/api', '')}${message.imageUrl}`}
                                  alt="Shared image"
                                  className="rounded-lg max-w-full h-auto"
                                />
                              </div>
                            )}
                            
                            <p className="text-sm">{message.content}</p>
                            
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              isMyMessage(message) ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">{formatTime(message.createdAt)}</span>
                              {getDeliveryStatusIcon(message)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">
                            {Array.from(typingUsers.values()).join(', ')} typing...
                          </span>
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
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={sending}
                />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Select a Chat</h3>
              <p>Choose a customer conversation from the sidebar to start chatting</p>
              {connectionStatus !== 'connected' && (
                <p className="text-sm text-red-500 mt-2">
                  Connection status: {connectionStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturerChat;