// utils/LLMService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Debug: Kiểm tra API key
console.log('🔍 DEBUG - LLMService loading...');
console.log('🔑 GEMINI_API_KEY từ process.env:', process.env.GEMINI_API_KEY ? 'Có' : 'Không có');
console.log('🔑 API Key length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('🔑 API Key preview:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');

// Khởi tạo Google Generative AI với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Sử dụng model gemini-1.5-flash
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const analyzeQuery = async (userQuery) => {
  const masterPrompt = `
    Bạn là trợ lý ảo của rạp phim Lumiere. Dựa vào câu hỏi của người dùng, 
    hãy phân tích và trả về một đối tượng JSON với hai key: 'intent' (ý định) 
    và 'entities' (thực thể).
    
    Các intent có thể là: 
    - 'find_schedules': Tìm lịch chiếu
    - 'get_movie_details': Lấy thông tin chi tiết phim
    - 'search_movies': Tìm kiếm phim
    - 'booking_help': Hỗ trợ đặt vé
    - 'cinema_info': Thông tin rạp chiếu
    - 'unknown': Không xác định được ý định

    Các entities có thể là: 
    - 'movie_title': Tên phim
    - 'location': Địa điểm/chi nhánh
    - 'date': Ngày tháng
    - 'genre': Thể loại phim
    - 'time': Thời gian

    Câu hỏi của người dùng: "${userQuery}"
    
    Hãy trả về kết quả dưới dạng JSON thuần túy, không có markdown formatting:
  `;
  try {
    // Kiểm tra API key trước khi gọi
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY không được tìm thấy trong biến môi trường');
    }

    console.log('🚀 Đang gọi Gemini API với query:', userQuery.substring(0, 50) + '...');
    
    // Gọi API Gemini
    const result = await model.generateContent(masterPrompt);
    const response = await result.response;
    const text = response.text();

    // Làm sạch response và parse JSON
    const cleanedText = text.replace(/```json|```/g, '').trim();
    
    // Thử parse JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch (parseError) {
      // Nếu không parse được, trả về default structure
      console.warn('Cannot parse Gemini response as JSON:', cleanedText);
      parsedResult = {
        intent: 'unknown',
        entities: {},
        raw_response: cleanedText
      };
    }    return parsedResult;

  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error.message);
    throw new Error('Không thể phân tích câu hỏi với Gemini.');
  }
};

module.exports = { analyzeQuery };