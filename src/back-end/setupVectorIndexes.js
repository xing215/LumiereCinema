// MongoDB Atlas Vector Search Index Configuration
// 
// IMPORTANT: These indexes must be created through MongoDB Atlas UI or Atlas CLI
// This script provides the exact configuration needed for the vector search indexes

console.log("🔧 MongoDB Atlas Vector Search Index Configuration");
console.log("================================================\n");

console.log("📋 STEP-BY-STEP SETUP INSTRUCTIONS:");
console.log("1. Go to MongoDB Atlas Dashboard (https://cloud.mongodb.com/)");
console.log("2. Navigate to your cluster");
console.log("3. Go to 'Search' tab");
console.log("4. Click 'Create Search Index'");
console.log("5. Select 'Vector Search' type");
console.log("6. Use the configurations below\n");

console.log("🎬 INDEX 1: Movies Vector Search");
console.log("Database: LumiereDB");
console.log("Collection: movies");
console.log("Index Name: vector_index_movies");
console.log("Vector Field: textEmbedding");
console.log("Dimensions: 768");
console.log("Similarity Function: cosine");
console.log("\nJSON Configuration:");

const moviesIndexConfig = {
  "fields": [
    {
      "type": "vector",
      "path": "textEmbedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "isHidden"
    },
    {
      "type": "filter", 
      "path": "genre"
    },
    {
      "type": "filter",
      "path": "ageRating"
    }
  ]
};

console.log(JSON.stringify(moviesIndexConfig, null, 2));

console.log("\n" + "=".repeat(50));
console.log("📅 INDEX 2: Schedules Vector Search");
console.log("Database: LumiereDB");
console.log("Collection: schedules");
console.log("Index Name: vector_index_schedules");
console.log("Vector Field: textEmbedding");
console.log("Dimensions: 768");
console.log("Similarity Function: cosine");
console.log("\nJSON Configuration:");

const schedulesIndexConfig = {
  "fields": [
    {
      "type": "vector",
      "path": "textEmbedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "startTime"
    },
    {
      "type": "filter",
      "path": "endTime"
    },
    {
      "type": "filter",
      "path": "isActive"
    }
  ]
};

console.log(JSON.stringify(schedulesIndexConfig, null, 2));

console.log("\n" + "=".repeat(50));
console.log("⚡ QUICK SETUP CHECKLIST:");
console.log("□ Create vector_index_movies with 768 dimensions");
console.log("□ Create vector_index_schedules with 768 dimensions");
console.log("□ Both indexes use 'cosine' similarity");
console.log("□ Both indexes target 'textEmbedding' field");
console.log("□ Wait for indexes to build (usually 5-10 minutes)");
console.log("□ Test vector search functionality");

console.log("\n🔍 VERIFICATION:");
console.log("After creating indexes, run:");
console.log("node testRAGFunctionality.js");
console.log("\n✅ Once vector searches work without errors, RAG is ready!");

console.log("\n💡 TROUBLESHOOTING:");
console.log("- If you get 'not indexed as vector' error, indexes aren't ready");
console.log("- Index building can take 5-15 minutes for large collections");
console.log("- Check Atlas UI for index status (Active/Building/Failed)");
console.log("- Verify index names match exactly: vector_index_movies & vector_index_schedules");
