const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Schedule = require('../models/Schedule');
const Screen = require('../models/Screen');
const Branch = require('../models/Branch');
const { 
  prepareMovieDocument, 
  prepareScheduleDocument, 
  generateEmbedding,
  testEmbeddingService
} = require('../utils/embeddingService');

// Load environment variables FIRST
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

/**
 * Generate and store embeddings for all movies
 */
async function generateMovieEmbeddings() {
  console.log('🎬 Starting movie embeddings generation...');
  
  try {
    const movies = await Movie.find({ isHidden: false }).lean();
    console.log(`Found ${movies.length} movies to process`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      
      try {
        // Prepare document text for embedding
        const documentText = prepareMovieDocument(movie);
        console.log(`\n[${i + 1}/${movies.length}] Processing: ${movie.title}`);
        console.log(`Document text: ${documentText.substring(0, 100)}...`);
        
        // Generate embedding
        const embedding = await generateEmbedding(documentText);
        
        // Update movie document with embedding
        await Movie.updateOne(
          { _id: movie._id },
          { 
            $set: { 
              textEmbedding: embedding,
              embeddingText: documentText,
              embeddingUpdatedAt: new Date()
            }
          }
        );
        
        successCount++;
        console.log(`✅ Successfully generated embedding for "${movie.title}" (${embedding.length} dimensions)`);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failureCount++;
        console.error(`❌ Failed to generate embedding for "${movie.title}":`, error.message);
        
        // Continue with next movie even if one fails
        continue;
      }
    }
    
    console.log(`\n🎬 Movie embeddings complete: ${successCount} success, ${failureCount} failures`);
    return { success: successCount, failures: failureCount };
    
  } catch (error) {
    console.error('Error generating movie embeddings:', error);
    throw error;
  }
}

/**
 * Generate and store embeddings for all schedules
 */
async function generateScheduleEmbeddings() {
  console.log('\n📅 Starting schedule embeddings generation...');
  
  try {
    // Get schedules with populated movie and branch data
    const schedules = await Schedule.find({
      startTime: { $gte: new Date() } // Only future schedules
    })
    .populate({
      path: 'movie',
      match: { isHidden: false }
    })
    .populate({
      path: 'screen',
      populate: {
        path: 'branch',
        match: { isActive: true }
      }
    })
    .lean();
    
    // Filter out schedules with null populated data
    const validSchedules = schedules.filter(schedule => 
      schedule.movie && schedule.screen && schedule.screen.branch
    );
    
    console.log(`Found ${validSchedules.length} valid schedules to process`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < validSchedules.length; i++) {
      const schedule = validSchedules[i];
      
      try {
        // Prepare document text for embedding
        const documentText = prepareScheduleDocument(schedule);
        console.log(`\n[${i + 1}/${validSchedules.length}] Processing schedule: ${schedule.movie.title} at ${schedule.screen.branch.name}`);
        console.log(`Document text: ${documentText.substring(0, 150)}...`);
        
        // Generate embedding
        const embedding = await generateEmbedding(documentText);
        
        // Update schedule document with embedding
        await Schedule.updateOne(
          { _id: schedule._id },
          { 
            $set: { 
              textEmbedding: embedding,
              embeddingText: documentText,
              embeddingUpdatedAt: new Date()
            }
          }
        );
        
        successCount++;
        console.log(`✅ Successfully generated embedding for schedule (${embedding.length} dimensions)`);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1200));
        
      } catch (error) {
        failureCount++;
        console.error(`❌ Failed to generate embedding for schedule:`, error.message);
        
        // Continue with next schedule even if one fails
        continue;
      }
    }
    
    console.log(`\n📅 Schedule embeddings complete: ${successCount} success, ${failureCount} failures`);
    return { success: successCount, failures: failureCount };
    
  } catch (error) {
    console.error('Error generating schedule embeddings:', error);
    throw error;
  }
}

/**
 * Main function to generate all embeddings
 */
async function generateAllEmbeddings() {
  try {
    console.log('🚀 Starting RAG embedding generation process...\n');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test embedding service first
    console.log('\n🧪 Testing embedding service...');
    const testResult = await testEmbeddingService();
    if (!testResult) {
      throw new Error('Embedding service test failed');
    }
    
    // Generate movie embeddings
    const movieResults = await generateMovieEmbeddings();
    
    // Generate schedule embeddings  
    const scheduleResults = await generateScheduleEmbeddings();
    
    // Summary
    console.log('\n🎉 RAG Embedding Generation Complete!');
    console.log('================================================');
    console.log(`Movies: ${movieResults.success} success, ${movieResults.failures} failures`);
    console.log(`Schedules: ${scheduleResults.success} success, ${scheduleResults.failures} failures`);
    console.log(`Total Success: ${movieResults.success + scheduleResults.success}`);
    console.log(`Total Failures: ${movieResults.failures + scheduleResults.failures}`);
    console.log('================================================');
    
    if (movieResults.failures > 0 || scheduleResults.failures > 0) {
      console.log('\n⚠️  Some embeddings failed. Check the logs above for details.');
    } else {
      console.log('\n✅ All embeddings generated successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Verify vector search indexes are created on MongoDB Atlas');
      console.log('2. Test RAG search functionality');
      console.log('3. Update chatbot controller to use RAG');
    }
    
  } catch (error) {
    console.error('❌ Fatal error in embedding generation:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  generateAllEmbeddings();
}

module.exports = {
  generateMovieEmbeddings,
  generateScheduleEmbeddings,
  generateAllEmbeddings
};
