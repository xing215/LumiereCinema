const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Embedding Service for RAG Architecture
 * Handles text embedding generation for movies and schedules using Google Gemini
 */

/**
 * Prepare movie document for embedding
 * @param {Object} movie - Movie document from MongoDB
 * @returns {string} Formatted text for embedding
 */
function prepareMovieDocument(movie) {
  const parts = [];
  
  // Title (most important)
  if (movie.title) {
    parts.push(`Title: ${movie.title}`);
  }
  
  // Description
  if (movie.description) {
    parts.push(`Description: ${movie.description}`);
  }
  
  // Genre
  if (movie.genre && Array.isArray(movie.genre)) {
    parts.push(`Genre: ${movie.genre.join(', ')}`);
  }
  
  // Director
  if (movie.director) {
    parts.push(`Director: ${movie.director}`);
  }
  
  // Cast
  if (movie.cast && Array.isArray(movie.cast)) {
    parts.push(`Cast: ${movie.cast.join(', ')}`);
  }
  
  // Duration and age rating
  if (movie.duration) {
    parts.push(`Duration: ${movie.duration} minutes`);
  }
  
  if (movie.ageRating) {
    parts.push(`Age Rating: ${movie.ageRating}`);
  }
  
  // Language
  if (movie.language) {
    parts.push(`Language: ${movie.language}`);
  }
  
  // Release date
  if (movie.releaseDate) {
    const releaseYear = new Date(movie.releaseDate).getFullYear();
    parts.push(`Release Year: ${releaseYear}`);
  }
  
  // Rating
  if (movie.ratingsAverage) {
    parts.push(`Rating: ${movie.ratingsAverage}/10`);
  }
  
  return parts.join('. ');
}

/**
 * Prepare schedule document for embedding
 * @param {Object} schedule - Schedule document with populated movie and branch data
 * @returns {string} Formatted text for embedding
 */
function prepareScheduleDocument(schedule) {
  const parts = [];
  
  // Movie information (most important for schedule search)
  if (schedule.movie) {
    parts.push(`Movie: ${schedule.movie.title}`);
    
    if (schedule.movie.genre && Array.isArray(schedule.movie.genre)) {
      parts.push(`Genre: ${schedule.movie.genre.join(', ')}`);
    }
    
    if (schedule.movie.director) {
      parts.push(`Director: ${schedule.movie.director}`);
    }
    
    if (schedule.movie.cast && Array.isArray(schedule.movie.cast)) {
      parts.push(`Starring: ${schedule.movie.cast.slice(0, 3).join(', ')}`);
    }
    
    if (schedule.movie.ageRating) {
      parts.push(`Age Rating: ${schedule.movie.ageRating}`);
    }
  }
  
  // Branch and location information
  if (schedule.screen && schedule.screen.branch) {
    const branch = schedule.screen.branch;
    parts.push(`Cinema: ${branch.name}`);
    
    if (branch.address) {
      parts.push(`Address: ${branch.address}`);
    }
    
    if (branch.city) {
      parts.push(`City: ${branch.city}`);
    }
  }
  
  // Screen information
  if (schedule.screen) {
    parts.push(`Screen: ${schedule.screen.screenName}`);
    
    if (schedule.screen.screenType) {
      parts.push(`Screen Type: ${schedule.screen.screenType}`);
    }
  }
  
  // Time information
  if (schedule.startTime) {
    const startDate = new Date(schedule.startTime);
    const dateStr = startDate.toLocaleDateString('vi-VN');
    const timeStr = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    parts.push(`Date: ${dateStr}`);
    parts.push(`Time: ${timeStr}`);
    
    // Day of week in Vietnamese
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    parts.push(`Day: ${dayNames[startDate.getDay()]}`);
  }
  
  // Duration
  if (schedule.movie && schedule.movie.duration) {
    parts.push(`Duration: ${schedule.movie.duration} minutes`);
  }
  
  // Seat availability
  if (schedule.screen && schedule.screen.totalSeats) {
    const totalSeats = schedule.screen.totalSeats;
    const occupiedSeats = schedule.OccupiedSeat ? schedule.OccupiedSeat.length : 0;
    const availableSeats = totalSeats - occupiedSeats;
    parts.push(`Available Seats: ${availableSeats}/${totalSeats}`);
  }
  
  return parts.join('. ');
}

/**
 * Generate embedding for a text using Google Gemini
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} Embedding vector (768 dimensions)
 */
async function generateEmbedding(text) {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for embedding');
    }
    
    // Use Google's text-embedding-004 model (768 dimensions)
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    
    if (!embedding || !embedding.values || !Array.isArray(embedding.values)) {
      throw new Error('Invalid embedding response from Google AI');
    }
    
    return embedding.values;
    
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate query embedding for search
 * @param {string} query - Search query
 * @returns {Promise<Array>} Query embedding vector
 */
async function generateQueryEmbedding(query) {
  try {
    // Enhance query with context for better embedding
    const enhancedQuery = `Movie cinema schedule search: ${query}`;
    return await generateEmbedding(enhancedQuery);
    
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}

/**
 * Batch generate embeddings for multiple texts
 * @param {Array} texts - Array of texts to embed
 * @returns {Promise<Array>} Array of embedding vectors
 */
async function batchGenerateEmbeddings(texts) {
  const embeddings = [];
  const batchSize = 5; // Process in small batches to avoid rate limits
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(async (text, index) => {
      try {
        const embedding = await generateEmbedding(text);
        return { index: i + index, embedding, success: true };
      } catch (error) {
        console.error(`Failed to generate embedding for text ${i + index}:`, error);
        return { index: i + index, embedding: null, success: false, error: error.message };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    embeddings.push(...batchResults);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }
  
  return embeddings;
}

/**
 * Test embedding generation
 * @returns {Promise<boolean>} Test result
 */
async function testEmbeddingService() {
  try {
    console.log('Testing embedding service...');
    
    const testText = 'Avatar is a science fiction movie directed by James Cameron';
    const embedding = await generateEmbedding(testText);
    
    console.log(`✅ Embedding generated successfully with ${embedding.length} dimensions`);
    console.log(`Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Embedding service test failed:', error);
    return false;
  }
}

module.exports = {
  prepareMovieDocument,
  prepareScheduleDocument,
  generateEmbedding,
  generateQueryEmbedding,
  batchGenerateEmbeddings,
  testEmbeddingService
};
