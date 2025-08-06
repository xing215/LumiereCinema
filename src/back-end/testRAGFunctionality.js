// Test script for RAG functionality
require('dotenv').config();
const mongoose = require('mongoose');
const MovieRetrieverService = require('./utils/movieRetrieverService');
const ScheduleRetrieverService = require('./utils/scheduleRetrieverService');

const MONGO_URI = process.env.MONGO_URI;

async function testRAGFunctionality() {
  try {
    console.log('🧪 Testing RAG Functionality...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Initialize services
    const movieRetriever = new MovieRetrieverService();
    const scheduleRetriever = new ScheduleRetrieverService();
    
    // Test 1: Movie search
    console.log('📽️  TEST 1: Movie Vector Search');
    console.log('Query: "siêu anh hùng Marvel"');
    
    try {
      const movieResults = await movieRetriever.searchMovies('siêu anh hùng Marvel', { limit: 3 });
      console.log(`Found ${movieResults.length} movies:`);
      
      movieResults.forEach((movie, index) => {
        console.log(`${index + 1}. ${movie.title}`);
        console.log(`   Genre: ${movie.genreString || 'N/A'}`);
        console.log(`   Score: ${movie.searchScore?.toFixed(4) || 'N/A'}`);
        console.log(`   Status: ${movie.status || 'N/A'}\n`);
      });
    } catch (error) {
      console.log('❌ Movie search failed:', error.message);
      
      // Try fallback
      console.log('🔄 Trying fallback search...');
      const fallbackResults = await movieRetriever.fallbackMovieSearch('siêu anh hùng Marvel', { limit: 3 });
      console.log(`Fallback found ${fallbackResults.length} movies:`);
      
      fallbackResults.forEach((movie, index) => {
        console.log(`${index + 1}. ${movie.title} (fallback)`);
        console.log(`   Genre: ${movie.genreString || 'N/A'}\n`);
      });
    }
    
    // Test 2: Schedule search
    console.log('📅 TEST 2: Schedule Vector Search');
    console.log('Query: "Avatar Nguyễn Văn Cừ"');
    
    try {
      const scheduleResults = await scheduleRetriever.searchSchedules('Avatar Nguyễn Văn Cừ', { limit: 3 });
      console.log(`Found ${scheduleResults.length} schedules:`);
      
      scheduleResults.forEach((schedule, index) => {
        console.log(`${index + 1}. ${schedule.movie.title}`);
        console.log(`   Branch: ${schedule.branch.name}`);
        console.log(`   Date: ${schedule.dateFormatted || 'N/A'}`);
        console.log(`   Time: ${schedule.timeFormatted || 'N/A'}`);
        console.log(`   Score: ${schedule.searchScore?.toFixed(4) || 'N/A'}\n`);
      });
    } catch (error) {
      console.log('❌ Schedule search failed:', error.message);
      
      // Try fallback
      console.log('🔄 Trying fallback search...');
      const fallbackResults = await scheduleRetriever.fallbackScheduleSearch('Avatar Nguyễn Văn Cừ', { limit: 3 });
      console.log(`Fallback found ${fallbackResults.length} schedules:`);
      
      fallbackResults.forEach((schedule, index) => {
        console.log(`${index + 1}. ${schedule.movie.title} (fallback)`);
        console.log(`   Branch: ${schedule.branch.name}\n`);
      });
    }
    
    // Test 3: Movie with schedules
    console.log('🎬 TEST 3: Movie with Schedules');
    console.log('Getting movie details with schedules...');
    
    try {
      // First find a movie
      const movieResults = await movieRetriever.searchMovies('action', { limit: 1 });
      
      if (movieResults.length > 0) {
        const movie = movieResults[0];
        console.log(`Testing with movie: ${movie.title}`);
        
        const movieWithSchedules = await movieRetriever.getMovieWithSchedules(movie._id);
        
        if (movieWithSchedules) {
          console.log(`✅ Found ${movieWithSchedules.scheduleCount} schedules for ${movieWithSchedules.movie.title}`);
          
          movieWithSchedules.schedules.slice(0, 3).forEach((schedule, index) => {
            console.log(`${index + 1}. ${schedule.branch.name} - ${schedule.dateFormatted} ${schedule.timeFormatted}`);
          });
        } else {
          console.log('❌ No schedules found for this movie');
        }
      } else {
        console.log('❌ No movies found to test schedules');
      }
    } catch (error) {
      console.log('❌ Movie with schedules test failed:', error.message);
    }
    
    // Test 4: Response formatting
    console.log('\n💬 TEST 4: Response Formatting');
    
    try {
      const testMovies = await movieRetriever.searchMovies('comedy', { limit: 2 });
      const formattedResponse = movieRetriever.formatMovieResults(testMovies, { query: 'comedy' });
      
      console.log('Formatted movie response:');
      console.log(`Type: ${formattedResponse.type}`);
      console.log(`Count: ${formattedResponse.count}`);
      console.log(`Summary: ${formattedResponse.summary}`);
      
      if (formattedResponse.results && formattedResponse.results.length > 0) {
        console.log('Sample result:');
        const sample = formattedResponse.results[0];
        console.log(`- Title: ${sample.title}`);
        console.log(`- Genre: ${sample.details.genre}`);
        console.log(`- Rating: ${sample.details.rating}`);
      }
    } catch (error) {
      console.log('❌ Response formatting test failed:', error.message);
    }
    
    console.log('\n🎉 RAG Functionality Test Complete!');
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('1. Movie vector search: Check output above');
    console.log('2. Schedule vector search: Check output above');
    console.log('3. Movie with schedules: Check output above');
    console.log('4. Response formatting: Check output above');
    
    console.log('\n📋 Next Steps:');
    console.log('1. If vector searches work, RAG is ready!');
    console.log('2. Test the enhanced chatbot functionality');
    console.log('3. Monitor performance and accuracy');
    
  } catch (error) {
    console.error('❌ Fatal error in RAG test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testRAGFunctionality();
}

module.exports = { testRAGFunctionality };
