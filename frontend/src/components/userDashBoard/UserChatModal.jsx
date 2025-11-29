import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Loader2, MessageCircle, 
  Package, Clock, CheckCheck, Check,
  AlertCircle, Building2
} from 'lucide-react';
import api from '../../axios/axiosInstance'; // Import axios instance

const UserChatModal = ({ isOpen, onClose, product, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && product) {
      initializeChat();
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (chatId) {
      const interval = setInterval(() => loadMessages(true), 3000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/chats', {
        productId: product._id
      });

      if (response.data.success && response.data.data) {
        setChatId(response.data.data._id);
        setMessages(response.data.data.messages || []);
      }
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (silent = false) => {
    if (!chatId) return;

    try {
      if (!silent) setLoading(true);
      
      const response = await api.get(`/chats/${chatId}`);

      if (response.data.success && response.data.data) {
        setMessages(response.data.data.messages || []);
      }
    } catch (err) {
      if (!silent) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const sendMessageHandler = async () => {
    if (!newMessage.trim() || !chatId || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setError('');

    try {
      const response = await api.post(`/chats/${chatId}/messages`, {
        message: messageContent
      });

      if (response.data.success && response.data.data) {
        setMessages(response.data.data.messages || []);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageHandler();
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-500/20 flex items-center justify-center">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {product.manufacturerName || 'Manufacturer'}
              </h3>
              <p className="text-xs text-blue-100 truncate max-w-xs">
                About: {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-4">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Start the conversation by sending a message
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                // FIXED: Check if message sender matches current user ID
                const isMine = String(msg.senderId) === String(currentUserId) || 
                              String(msg.senderId?._id) === String(currentUserId);
                
                return (
                  <div
                    key={index}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%]`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                        }`}
                      >
                        {!isMine && (
                          <p className="text-xs font-semibold mb-1 text-gray-600 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMine ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{formatTime(msg.createdAt)}</p>
                        {isMine && (
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

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending || loading || !chatId}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
            />
            <button
              onClick={sendMessageHandler}
              disabled={sending || !newMessage.trim() || !chatId}
              className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            Chat with the manufacturer about this product
          </p>
        </div>
      </div>
    </div>
  );
};


export default UserChatModal;