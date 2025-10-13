import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Search, X, Loader2, 
  Package, User, Clock, CheckCheck, Check,
  AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import api from '../../axios/axiosInstance';

const ManufacturerChat = ({ manufacturerId }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const chatListRef = useRef(null);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages(selectedChat._id);
      markAsRead(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setRefreshing(true);
      const response = await api.get(`/chats/manufacturer?status=${filterStatus}`);
      
      if (response.data.success) {
        setChats(response.data.data);
        console.log('✅ Fetched chats:', response.data.count);
      }
    } catch (err) {
      console.error('❌ Error fetching chats:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === chatId 
              ? { ...chat, unreadCountManufacturer: 0 }
              : chat
          )
        );
      }
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const markAsRead = async (chatId) => {
    try {
      await api.get(`/chats/${chatId}`);
    } catch (err) {
      console.error('❌ Error marking as read:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);
      setError('');

      const response = await api.post(`/chats/${selectedChat._id}/messages`, {
        message: newMessage.trim()
      });

      if (response.data.success) {
        setMessages(response.data.data.messages);
        setNewMessage('');
        
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === selectedChat._id
              ? { 
                  ...chat, 
                  lastMessageAt: new Date(),
                  messages: response.data.data.messages
                }
              : chat
          )
        );
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    try {
      await api.delete(`/chats/${chatId}`);
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('❌ Error deleting chat:', err);
      alert('Failed to delete chat');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.message.length > 50 
      ? lastMsg.message.substring(0, 50) + '...' 
      : lastMsg.message;
  };

  const filteredChats = chats.filter(chat => {
    const userName = chat.userId?.name?.toLowerCase() || '';
    const productName = chat.productName?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return userName.includes(query) || productName.includes(query);
  });

  const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCountManufacturer || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Conversations
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
            <button
              onClick={fetchChats}
              disabled={refreshing}
              className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilterStatus('active')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('archived')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" ref={chatListRef}>
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No conversations found</p>
              <p className="text-gray-400 text-xs mt-1">
                {searchQuery ? 'Try a different search' : 'Chats will appear here'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredChats.map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {chat.productId?.images?.[0] ? (
                        <img 
                          src={chat.productId.images[0]} 
                          alt={chat.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400 m-auto mt-3" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm text-gray-800 truncate flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-500" />
                          {chat.userName || 'Unknown User'}
                        </h4>
                        {chat.unreadCountManufacturer > 0 && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                            {chat.unreadCountManufacturer}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-blue-600 mb-1 truncate">
                        {chat.productName}
                      </p>

                      <p className="text-xs text-gray-600 truncate mb-1">
                        {getLastMessage(chat)}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(chat.lastMessageAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                  {selectedChat.productId?.images?.[0] ? (
                    <img 
                      src={selectedChat.productId.images[0]} 
                      alt={selectedChat.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400 m-auto mt-3" />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {selectedChat.userName || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    About: {selectedChat.productName}
                  </p>
                  {selectedChat.productId?.price && (
                    <p className="text-xs text-blue-600">
                      ${selectedChat.productId.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteChat(selectedChat._id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  title="Delete Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <button onClick={() => setError('')} className="flex-shrink-0">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No messages yet</p>
                    <p className="text-gray-400 text-xs mt-1">Be the first to respond!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isOwnMessage = msg.senderId === manufacturerId;
                    return (
                      <div
                        key={index}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                          >
                            {!isOwnMessage && (
                              <p className="text-xs font-semibold mb-1 text-gray-600">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm break-words">{msg.message}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${
                            isOwnMessage ? 'justify-end' : 'justify-start'
                          }`}>
                            <p className="text-xs text-gray-500">
                              {formatTime(msg.createdAt)}
                            </p>
                            {isOwnMessage && (
                              msg.isRead ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3 text-gray-400" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Reply promptly to maintain good customer relationships
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 text-sm">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturerChat ;