require('dotenv').config();
const { connectToDatabase } = require('./config/database.config');

async function checkEmbeddingStatus() {
  try {
    await connectToDatabase();
    const db = require('mongoose').connection.db;
    
    const moviesWithEmbeddings = await db.collection('movies').countDocuments({ 
      textEmbedding: { $exists: true } 
    });
    
    const schedulesWithEmbeddings = await db.collection('schedules').countDocuments({ 
      textEmbedding: { $exists: true } 
    });
    
    const totalMovies = await db.collection('movies').countDocuments({ status: 'Active' });
    const totalSchedules = await db.collection('schedules').countDocuments({ 
      date: { $gte: new Date() } 
    });
    
    console.log('📊 Embedding Status:');
    console.log(`Movies: ${moviesWithEmbeddings}/${totalMovies} have embeddings`);
    console.log(`Schedules: ${schedulesWithEmbeddings}/${totalSchedules} have embeddings`);
    
    // Check if we have vector search indexes
    const collections = await db.listCollections().toArray();
    const movieIndexes = await db.collection('movies').indexes();
    const scheduleIndexes = await db.collection('schedules').indexes();
    
    console.log('\n🔍 Vector Search Indexes:');
    console.log('Movie indexes:', movieIndexes.map(i => i.name));
    console.log('Schedule indexes:', scheduleIndexes.map(i => i.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEmbeddingStatus();
