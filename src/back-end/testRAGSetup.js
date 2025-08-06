// Quick test script for RAG setup
require('dotenv').config();

async function testRAGSetup() {
  console.log('🧪 Testing RAG setup...');
  
  // 1. Test environment variables
  console.log('\n1. Environment Variables:');
  console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
  console.log('GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.MONGO_URI) {
    console.log('\n❌ MONGO_URI not found. Please create .env file with MongoDB Atlas connection string.');
    console.log('Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lumiere_cinema');
    return;
  }
  
  if (!process.env.GOOGLE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.log('\n❌ Google AI API key not found. Please add GOOGLE_AI_API_KEY to .env file.');
    console.log('Get your API key from: https://makersuite.google.com/app/apikey');
    return;
  }
  
  // 2. Test MongoDB connection
  console.log('\n2. Testing MongoDB connection...');
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test collections
    const Movie = require('./models/Movie');
    const Schedule = require('./models/Schedule');
    
    const movieCount = await Movie.countDocuments({ isHidden: false });
    const scheduleCount = await Schedule.countDocuments({ startTime: { $gte: new Date() } });
    
    console.log(`📽️  Found ${movieCount} active movies`);
    console.log(`📅 Found ${scheduleCount} future schedules`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    return;
  }
  
  // 3. Test Google AI embedding
  console.log('\n3. Testing Google AI embedding...');
  try {
    const { testEmbeddingService } = require('./utils/embeddingService');
    const testResult = await testEmbeddingService();
    
    if (testResult) {
      console.log('✅ Google AI embedding service working');
    } else {
      console.log('❌ Google AI embedding service failed');
    }
  } catch (error) {
    console.log('❌ Embedding service test failed:', error.message);
  }
  
  console.log('\n🎉 RAG Setup Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. If all tests passed, run: node scripts/generateInitialEmbeddings.js');
  console.log('2. Monitor the embedding generation process');
  console.log('3. Test the enhanced chatbot functionality');
}

testRAGSetup().catch(console.error);
