const { analyzeQuery } = require('../utils/LLMService.js');

/**
 * @desc    Query chatbot with Gemini AI
 * @route   POST /api/chatbot/query
 * @access  Public
 */
const queryChatbot = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({
        error: 'Câu hỏi không được để trống'
      });
    }

    // Analyze user query with Gemini AI
    const analysis = await analyzeQuery(question.trim());

    return res.status(200).json({
      success: true,
      userQuestion: question,
      analysis,
      message: 'Phân tích câu hỏi thành công'
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    return res.status(500).json({
      error: 'Lỗi khi xử lý câu hỏi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  queryChatbot
};