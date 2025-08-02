// hooks/useChatbot.js
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '@config/api.config';
import { useUser } from '@contexts/UserContext';

/**
 * Custom hook để quản lý chatbot
 * 
 * Kiến thức: Hook này đảm nhận việc:
 * 1. Quản lý danh sách tin nhắn (messages)
 * 2. Gửi tin nhắn tới backend API
 * 3. Quản lý trạng thái loading và error
 * 4. Tự động tạo sessionId để duy trì ngữ cảnh hội thoại
 */
const useChatbot = () => {  // Lấy thông tin user để theo dõi trạng thái đăng nhập
  const { isAuthenticated, user } = useUser();
  
  // State cho danh sách tin nhắn
  const [messages, setMessages] = useState(() => {
    // BƯỚC 3: Khôi phục messages từ localStorage khi khởi tạo
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        console.log('📥 Restoring chat messages from localStorage...');
        return JSON.parse(savedMessages);
      }
    } catch (error) {
      console.error('Error loading saved messages:', error);
    }
    
    // Nếu không có messages được lưu, trả về tin nhắn mặc định
    return [
      {
        id: '1',
        message: 'Xin chào! Tôi có thể giúp bạn tìm phim, xem lịch chiếu, và đặt vé. Bạn cần hỗ trợ gì?',
        sentTime: 'just now',
        sender: 'ChatBot',
        direction: 'incoming',
        type: 'text'
      }
    ];
  });

  // State cho trạng thái loading và error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // SessionId để duy trì ngữ cảnh hội thoại
  const [sessionId] = useState(() => {
    // Tạo sessionId duy nhất cho mỗi người dùng
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  /**
   * BƯỚC 1: Lắng nghe sự kiện logout để clear messages
   * Effect này sẽ chạy khi user logout (isAuthenticated thay đổi từ true -> false)
   */
  useEffect(() => {
    // Nếu user logout (không authenticated), clear messages
    if (!isAuthenticated && user === null) {
      console.log('🔄 User logged out, clearing chat messages...');
      clearMessages();
    }
  }, [isAuthenticated, user]);

  /**
   * BƯỚC 4: Tự động lưu messages vào localStorage khi messages thay đổi
   */
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
      console.log('💾 Messages saved to localStorage');
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [messages]);

  /**
   * Hàm gửi tin nhắn tới chatbot
   * 
   * @param {string} userMessage - Tin nhắn của người dùng
   */
  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    // Tạo tin nhắn từ người dùng
    const userMsg = {
      id: Date.now().toString(),
      message: userMessage,
      sentTime: 'just now',
      sender: 'User',
      direction: 'outgoing',
      type: 'text'
    };

    // Thêm tin nhắn người dùng vào danh sách
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // Gửi request tới backend
      const response = await axios.post(getApiUrl('chatbotQuery'), {
        question: userMessage,
        sessionId: sessionId
      });

      const botResponse = response.data;

      // Tạo tin nhắn phản hồi từ bot
      const botMsg = {
        id: (Date.now() + 1).toString(),
        message: botResponse.message || 'Xin lỗi, tôi không hiểu câu hỏi của bạn.',
        sentTime: 'just now',
        sender: 'ChatBot',
        direction: 'incoming',
        type: 'text',
        // Lưu thêm data từ backend để sử dụng sau
        botData: botResponse
      };

      // Thêm tin nhắn bot vào danh sách
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error('Error sending message to chatbot:', err);
      
      // Tạo tin nhắn lỗi
      const errorMsg = {
        id: (Date.now() + 2).toString(),
        message: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sentTime: 'just now',
        sender: 'ChatBot',
        direction: 'incoming',
        type: 'text'
      };

      setMessages(prev => [...prev, errorMsg]);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);  /**
   * BƯỚC 2: Hàm xóa tất cả tin nhắn (chỉ được gọi khi logout)
   */
  const clearMessages = useCallback(() => {
    console.log('🧹 Clearing chat messages...');
    const defaultMessages = [
      {
        id: '1',
        message: 'Xin chào! Tôi có thể giúp bạn tìm phim, xem lịch chiếu, và đặt vé. Bạn cần hỗ trợ gì?',
        sentTime: 'just now',
        sender: 'ChatBot',
        direction: 'incoming',
        type: 'text'
      }
    ];
    
    setMessages(defaultMessages);
    setError(null);
    
    // BƯỚC 5: Xóa messages từ localStorage
    try {
      localStorage.removeItem('chatMessages');
      console.log('🗑️ Messages cleared from localStorage');
    } catch (error) {
      console.error('Error clearing messages from localStorage:', error);
    }
  }, []);

  /**
   * Hàm gửi quick action (khi người dùng click vào gợi ý)
   */
  const sendQuickAction = useCallback((actionText) => {
    sendMessage(actionText);
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
    sendQuickAction
  };
};

export default useChatbot;
