const mongoose = require('mongoose');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const Movie = require('../models/Movie');
const Schedule = require('../models/Schedule');
const Screen = require('../models/Screen'); // DÒNG THÊM VÀO
const Branch = require('../models/Branch'); // DÒNG THÊM VÀO
const { 
  prepareMovieDocument, 
  prepareScheduleDocument, 
  generateEmbedding,
  testEmbeddingService
} = require('../utils/embeddingService');

const MONGODB_URI = process.env.MONGO_URI;

/**
 * Generate and store embeddings for all movies
 */
async function generateMovieEmbeddings() {
  console.log('🎬 Starting movie embeddings generation...');
  
  try {
    const movies = await Movie.find({ embedding: { $exists: false } }).lean();
    
    if (movies.length === 0) {
      console.log('✨ All movies already have embeddings. Nothing to do.');
      return { success: 0, failures: 0 };
    }

    console.log(`Found ${movies.length} movies to process`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      
      try {
        const documentText = prepareMovieDocument(movie);
        console.log(`\n[${i + 1}/${movies.length}] Processing: ${movie.title}`);
        
        const embedding = await generateEmbedding(documentText);
        
        await Movie.updateOne(
          { _id: movie._id },
          { 
            $set: { 
              embedding: embedding,
              embeddingText: documentText,
              embeddingUpdatedAt: new Date()
            }
          }
        );
        
        successCount++;
        console.log(`✅ Successfully generated embedding for "${movie.title}"`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failureCount++;
        console.error(`❌ Failed to generate embedding for "${movie.title}":`, error.message);
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
    const schedules = await Schedule.find({
      startTime: { $gte: new Date() },
      embedding: { $exists: false }
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
    
    const validSchedules = schedules.filter(schedule => 
      schedule.movie && schedule.screen && schedule.screen.branch
    );
    
    if (validSchedules.length === 0) {
      console.log('✨ All future schedules already have embeddings. Nothing to do.');
      return { success: 0, failures: 0 };
    }

    console.log(`Found ${validSchedules.length} valid schedules to process`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < validSchedules.length; i++) {
      const schedule = validSchedules[i];
      
      try {
        const documentText = prepareScheduleDocument(schedule);
        console.log(`\n[${i + 1}/${validSchedules.length}] Processing schedule: ${schedule.movie.title} at ${schedule.screen.branch.name}`);
        
        const embedding = await generateEmbedding(documentText);
        
        await Schedule.updateOne(
          { _id: schedule._id },
          { 
            $set: { 
              embedding: embedding,
              embeddingText: documentText,
              embeddingUpdatedAt: new Date()
            }
          }
        );
        
        successCount++;
        console.log(`✅ Successfully generated embedding for schedule`);
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        
      } catch (error) {
        failureCount++;
        console.error(`❌ Failed to generate embedding for schedule:`, error.message);
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
    
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file or the file path is incorrect.");
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🧪 Testing embedding service...');
    const testResult = await testEmbeddingService();
    if (!testResult) {
      throw new Error('Embedding service test failed');
    }
    
    const movieResults = await generateMovieEmbeddings();
    const scheduleResults = await generateScheduleEmbeddings();
    
    console.log('\n🎉 RAG Embedding Generation Complete!');
    console.log('================================================');
    console.log(`Movies: ${movieResults.success} success, ${movieResults.failures} failures`);
    console.log(`Schedules: ${scheduleResults.success} success, ${scheduleResults.failures} failures`);
    console.log('================================================');
    
    if (movieResults.failures > 0 || scheduleResults.failures > 0) {
      console.log('\n⚠️  Some embeddings failed. Check the logs above for details.');
    } else {
      console.log('\n✅ All embeddings generated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Fatal error in embedding generation:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

generateAllEmbeddings();