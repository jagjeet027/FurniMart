  import React, { useState, useEffect, useRef } from 'react';
  import {
    X,
    Send,
    Phone,
    Video,
    Loader2,
    AlertCircle,
    Check,    
    CheckCheck
  } from 'lucide-react';

  const FixedChatModal = ({ isOpen, onClose, product, userInfo }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatRoom, setChatRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const messagesEndRef = useRef(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
        console.log('Product data:', product);
        console.log('User info:', userInfo);

        // FIXED: Handle manufacturer ID properly based on your Product schema
        // Your product schema stores manufacturer as String, not ObjectId
        let manufacturerId = null;
        let manufacturerName = 'Manufacturer';

        // Since your Product model has manufacturer as String field
        if (product.manufacturer) {
          manufacturerId = product.manufacturer; // This is a string
          manufacturerName = product.manufacturerInfo || product.manufacturer;
        }

        if (!manufacturerId) {
          throw new Error('Manufacturer information not found for this product');
        }

        const requestBody = {
          productId: product._id || product.id,
          userId: userInfo.id,
          userType: userInfo.type || 'wholeseller',
          userName: userInfo.name,
          userEmail: userInfo.email,
          productName: product.name,
          manufacturerId: manufacturerId, // This will be a string
          manufacturerName: manufacturerName
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

        const data = await response.json();
        console.log('Chat room response:', data);

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (data.success) {
          setChatRoom(data.chatRoom);
          
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

        const data = await response.json();
        console.log('Messages loaded:', data);

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

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

      try {
        console.log('Sending message:', messageContent);

        const messageData = {
          chatRoomId: chatRoom._id,
          senderId: userInfo.id,
          senderType: userInfo.type || 'wholeseller',
          senderName: userInfo.name,
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

        const data = await response.json();
        console.log('Message sent:', data);

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.message || 'Failed to send message');
        }

        // Add message to current messages
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();

      } catch (error) {
        console.error('Error sending message:', error);
        setError(`Failed to send message: ${error.message}`);
        setNewMessage(messageContent);
      } finally {
        setSending(false);
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

    const manufacturerName = product?.manufacturerInfo || 
                            product?.manufacturer || 
                            'Manufacturer';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold">
                {manufacturerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{manufacturerName}</h3>
                <p className="text-xs opacity-90">{product?.name || 'Product Chat'}</p>
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
              <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm flex-1">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-500 hover:text-red-700 flex-shrink-0"
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
                          {manufacturerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-700">{manufacturerName}</h4>
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
                            {message.sender?.name || manufacturerName}
                          </div>
                        )}
                        
                        <p className="text-sm">{message.content}</p>
                        
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          isMyMessage(message) ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{formatTime(message.createdAt)}</span>
                          {isMyMessage(message) && (
                            <div>
                              {message.deliveryStatus === 'read' ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : message.deliveryStatus === 'delivered' ? (
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
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={sending || loading || !!error}
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending || loading || !!error}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && (
              <button
                onClick={() => {
                  setError('');
                  initializeChatRoom();
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default FixedChatModal;