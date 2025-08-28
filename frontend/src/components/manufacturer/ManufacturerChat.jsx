
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
  Users,
  Package,
  Clock,
  Star,
  MapPin,
  Search
} from 'lucide-react';
import io from 'socket.io-client';

const ManufacturerChat = ({ manufacturerId }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  
  // Get manufacturer info - replace with actual auth system
  const manufacturerInfo = {
    id: manufacturerId || localStorage.getItem('manufacturerId') || localStorage.getItem('userId'),
    name: localStorage.getItem('manufacturerName') || 'Manufacturer',
    email: localStorage.getItem('manufacturerEmail') || 'manufacturer@example.com',
    type: 'manufacturer'
  };

  // Initialize socket connection
  useEffect(() => {
    if (!manufacturerInfo.id) {
      setError('Manufacturer ID not found. Please login again.');
      return;
    }

    const newSocket = io(SOCKET_URL, {
      forceNew: true,
      timeout: 5000,
      transports: ['websocket']
    });
    
    newSocket.on('connect', () => {
      console.log('Manufacturer connected to socket server');
      newSocket.emit('user-join', {
        userId: manufacturerInfo.id,
        userType: manufacturerInfo.type,
        userName: manufacturerInfo.name
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // **CRITICAL: Listen for new chat rooms**
    newSocket.on('new-chat-room', (data) => {
      console.log('New chat room created:', data);
      // Reload chat rooms to show new conversation
      loadChatRooms();
    });

    // **CRITICAL: Listen for new messages**
    newSocket.on('new-message', (message) => {
      console.log('New message received:', message);
      
      if (selectedChatRoom && message.chatRoom === selectedChatRoom._id) {
        setMessages(prev => {
          const exists = prev.find(msg => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      }
      
      // Update chat room list with new message
      setChatRooms(prev => 
        prev.map(room => 
          room._id === message.chatRoom 
            ? {
                ...room,
                lastMessage: {
                  message: message.content,
                  sender: message.sender.name,
                  timestamp: message.createdAt
                }
              }
            : room
        )
      );
    });

    // **CRITICAL: Listen for chat notifications**
    newSocket.on('new-chat-notification', (data) => {
      console.log('New chat notification:', data);
      // Show notification or update UI
      loadChatRooms();
    });

    newSocket.on('user-typing', (data) => {
      if (data.userId !== manufacturerInfo.id && selectedChatRoom && data.chatRoomId === selectedChatRoom._id) {
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

    newSocket.on('user-online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('user-offline', (userId) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [selectedChatRoom]);

  // Load chat rooms on component mount
  useEffect(() => {
    if (manufacturerInfo.id) {
      loadChatRooms();
    }
  }, [manufacturerInfo.id]);

  // Join selected chat room
  useEffect(() => {
    if (selectedChatRoom && socket) {
      socket.emit('join-chat', selectedChatRoom._id);
      loadMessages(selectedChatRoom._id);
    }
  }, [selectedChatRoom, socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/rooms/${manufacturerInfo.id}?userType=manufacturer`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setChatRooms(data.chatRooms || []);
      } else {
        throw new Error(data.message || 'Failed to load chat rooms');
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setError(`Failed to load chat rooms: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId) => {
    setMessages([]); // Clear previous messages
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/${chatRoomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
      } else {
        throw new Error(data.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChatRoom || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    if (socket) {
      socket.emit('typing-stop', {
        chatRoomId: selectedChatRoom._id,
        userId: manufacturerInfo.id,
        userName: manufacturerInfo.name
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          chatRoomId: selectedChatRoom._id,
          senderId: manufacturerInfo.id,
          senderType: manufacturerInfo.type,
          senderName: manufacturerInfo.name,
          content: messageContent
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Message will be added via socket event
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error.message}`);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      sendImageMessage(file);
    }
  };

  const sendImageMessage = async (imageFile) => {
    if (!selectedChatRoom || sending) return;

    setSending(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('chatRoomId', selectedChatRoom._id);
      formData.append('senderId', manufacturerInfo.id);
      formData.append('senderType', manufacturerInfo.type);
      formData.append('senderName', manufacturerInfo.name);

      const response = await fetch(`${API_BASE_URL}/chat/message/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send image');
      }

      // Message will be added via socket event
    } catch (error) {
      console.error('Error sending image:', error);
      setError(`Failed to send image: ${error.message}`);
    } finally {
      setSending(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTyping = () => {
    if (socket && selectedChatRoom) {
      socket.emit('typing-start', {
        chatRoomId: selectedChatRoom._id,
        userId: manufacturerInfo.id,
        userName: manufacturerInfo.name
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socket) {
          socket.emit('typing-stop', {
            chatRoomId: selectedChatRoom._id,
            userId: manufacturerInfo.id,
            userName: manufacturerInfo.name
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const isMyMessage = (message) => {
    return message.sender?.userId === manufacturerInfo.id;
  };

  const getWholeseller = (chatRoom) => {
    return chatRoom.participants?.find(p => p.userType === 'wholeseller');
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Filter chat rooms based on search
  const filteredChatRooms = chatRooms.filter(room => {
    if (!searchTerm) return true;
    const wholeseller = getWholeseller(room);
    const searchLower = searchTerm.toLowerCase();
    return (
      room.productName?.toLowerCase().includes(searchLower) ||
      wholeseller?.name?.toLowerCase().includes(searchLower) ||
      room.lastMessage?.message?.toLowerCase().includes(searchLower)
    );
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar - Chat Rooms */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8" />
            <div>
              <h2 className="font-semibold text-lg">Manufacturer Dashboard</h2>
              <p className="text-blue-100 text-sm">{manufacturerInfo.name}</p>
            </div>
          </div>
        </div>

        {/* Search/Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : filteredChatRooms.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              {searchTerm ? (
                <>
                  <p>No conversations found</p>
                  <p className="text-sm">Try different search terms</p>
                </>
              ) : (
                <>
                  <p>No conversations yet</p>
                  <p className="text-sm">Wholesellers will appear here when they start chatting</p>
                </>
              )}
            </div>
          ) : (
            filteredChatRooms.map((chatRoom) => {
              const wholeseller = getWholeseller(chatRoom);
              const isOnline = wholeseller ? isUserOnline(wholeseller.userId) : false;
              
              return (
                <div
                  key={chatRoom._id}
                  onClick={() => setSelectedChatRoom(chatRoom)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChatRoom?._id === chatRoom._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {wholeseller?.name || 'Wholeseller'}
                        </h3>
                        {chatRoom.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chatRoom.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate flex items-center">
                        <Package className="w-3 h-3 mr-1" />
                        {chatRoom.productName}
                      </p>
                      {chatRoom.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {chatRoom.lastMessage.sender}: {chatRoom.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  {getWholeseller(selectedChatRoom) && 
                   isUserOnline(getWholeseller(selectedChatRoom).userId) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getWholeseller(selectedChatRoom)?.name || 'Wholeseller'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-1" />
                    {selectedChatRoom.productName}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation with this wholeseller</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isMine = isMyMessage(message);
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMine
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 shadow-sm border'
                        }`}
                      >
                        {!isMine && (
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            {message.sender?.name || 'Wholeseller'}
                          </div>
                        )}

                        {message.messageType === 'image' ? (
                          <div>
                            <img
                              src={message.imageUrl?.startsWith('http') 
                                ? message.imageUrl 
                                : `${API_BASE_URL}${message.imageUrl}`}
                              alt="Shared image"
                              className="rounded-lg mb-1 max-w-full h-auto cursor-pointer hover:opacity-90"
                              onClick={() => window.open(
                                message.imageUrl?.startsWith('http') 
                                  ? message.imageUrl 
                                  : `${API_BASE_URL}${message.imageUrl}`, 
                                '_blank'
                              )}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                console.error('Image failed to load:', message.imageUrl);
                              }}
                            />
                            {message.content && message.content !== 'Image' && (
                              <p className="text-sm">{message.content}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        
                        <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                          isMine ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.createdAt)}</span>
                          {isMine && (
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
                  );
                })
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{typingUser} is typing</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={sending}
                >
                  <Image className="w-5 h-5" />
                </button>
                
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={sending}
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
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
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Manufacturer Chat Dashboard
              </h3>
              
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturerChat;