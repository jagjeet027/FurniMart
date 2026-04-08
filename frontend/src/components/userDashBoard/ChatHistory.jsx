import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MessageCircle, Package, Trash2, Loader2, Search,
  Building2, AlertCircle, User as UserIcon, Clock,
  CheckCheck, RefreshCw, X, Send
} from 'lucide-react';
import api from '../../axios/axiosInstance';

const ChatHistory = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // FIXED: Use useCallback directly (already imported)
  const loadUserData = useCallback(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, []);

  const fetchChats = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      
      setError('');
      
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const endpoint = userData?.isManufacturer 
        ? '/chats/manufacturer'
        : '/chats/user';

      const response = await api.get(endpoint);

      if (response.data.success) {
        setChats(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    fetchChats();
    
    const interval = setInterval(() => fetchChats(false), 30000);
    return () => clearInterval(interval);
  }, [loadUserData, fetchChats]);

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      setDeletingId(chatId);
      
      await api.delete(`/chats/${chatId}`);
      
      setChats(chats.filter(chat => chat._id !== chatId));
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert(err.response?.data?.message || 'Failed to delete chat');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenChat = (chat) => {
    setSelectedChat({
      _id: chat._id,
      chatId: chat._id,
      productId: chat.productId?._id,
      name: chat.productName,
      manufacturer: chat.manufacturerName,
      manufacturerName: chat.manufacturerName,
      price: chat.productId?.price,
      images: chat.productId?.images,
      userName: chat.userName,
      userId: chat.userId
    });
    setIsChatModalOpen(true);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredChats = chats.filter(chat => 
    chat.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.manufacturerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chat.userName && chat.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (error && !chats.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Chats</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchChats()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user?.isManufacturer ? 'Customer Chats' : 'My Chats'}
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchChats(false)}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh chats"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product, manufacturer, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredChats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            {searchTerm ? (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search term</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-4">
                  {user?.isManufacturer 
                    ? 'When customers message you about products, conversations will appear here'
                    : 'Start chatting with manufacturers about products you\'re interested in'
                  }
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => {
              const unreadCount = user?.isManufacturer 
                ? chat.unreadCountManufacturer || 0
                : chat.unreadCountUser || 0;
              const lastMessage = chat.messages?.[chat.messages.length - 1];

              return (
                <div
                  key={chat._id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border ${
                    unreadCount > 0 ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {chat.productId?.images?.[0] ? (
                        <img
                          src={chat.productId.images[0]}
                          alt={chat.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400 m-auto mt-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate flex items-center gap-2">
                            {chat.productName}
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                {unreadCount}
                              </span>
                            )}
                          </h3>
                          
                          {user?.isManufacturer ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <UserIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">Customer: {chat.userName || 'Unknown'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{chat.manufacturerName}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(chat.lastMessageAt || chat.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {lastMessage && (
                        <div className="flex items-start gap-2 mt-2">
                          <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            <span className="font-medium">
                              {lastMessage.senderName}:
                            </span>{' '}
                            {lastMessage.message}
                          </p>
                          {lastMessage.isRead && (
                            <CheckCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleOpenChat(chat)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Open Chat
                        </button>
                        {!user?.isManufacturer && (
                          <button
                            onClick={() => handleDeleteChat(chat._id)}
                            disabled={deletingId === chat._id}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === chat._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">
              {user?.isManufacturer ? 'Customer Communication' : 'Chat Information'}
            </p>
            <p>
              {user?.isManufacturer 
                ? 'Respond quickly to customer inquiries to improve your business reputation and customer satisfaction.'
                : 'Chats are automatically deleted after 30 days of inactivity to keep your inbox clean.'
              }
            </p>
          </div>
        </div>
      </div>

      {isChatModalOpen && selectedChat && (
        <ChatModalWrapper
          chat={selectedChat}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedChat(null);
            fetchChats(false);
          }}
          isManufacturer={user?.isManufacturer}
        />
      )}
    </div>
  );
};

// ============================================================================
// CHAT MODAL WRAPPER FOR CHAT HISTORY
// ============================================================================
const ChatModalWrapper = ({ chat, onClose, isManufacturer }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // FIXED: Use useCallback directly (already imported)
  const loadMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await api.get(`/chats/${chat.chatId}`);

      if (response.data.success && response.data.data) {
        setMessages(response.data.data.messages || []);
      }
    } catch (err) {
      if (!silent) setError('Failed to load messages');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [chat.chatId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => loadMessages(true), 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await api.post(`/chats/${chat.chatId}/messages`, {
        message: content
      });

      if (response.data.success && response.data.data) {
        setMessages(response.data.data.messages || []);
      }
    } catch (err) {
      setError('Failed to send message');
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const currentUserId = JSON.parse(localStorage.getItem('userData') || '{}')._id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center font-semibold">
              {(isManufacturer ? chat.userName : chat.manufacturerName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {isManufacturer ? chat.userName : chat.manufacturerName}
              </h3>
              <p className="text-xs opacity-90">{chat.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              // FIXED: Check if message sender matches current user ID
              // Check multiple possible ID formats from backend
              const msgSenderId = msg.senderId?._id || msg.senderId;
              const isMine = String(msgSenderId) === String(currentUserId);
              
              console.log('Message Debug:', {
                msgSenderId: msgSenderId,
                currentUserId: currentUserId,
                isMine: isMine,
                senderName: msg.senderName
              });
              
              return (
                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    isMine ? 'bg-blue-600 text-white' : 'bg-white border'
                  }`}>
                    {!isMine && <div className="text-xs font-medium mb-1 text-gray-700">{msg.senderName}</div>}
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-75">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && <span className="text-xs ml-2">You</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;