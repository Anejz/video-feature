const { Pinecone }= require('@pinecone-database/pinecone');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();
const openai = new OpenAI();

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });
const index = pc.index('video-transcriptions');

async function getQueryEmbedding(query) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large", // Use the same model you used for your video embeddings
      input: query
    })
  
    return response.data[0].embedding; // Adjust this based on the actual response structure
}

async function fetchVideoRecommendation(query) {
    const embedding = await getQueryEmbedding(query);
    
    try {
        // Correctly format the query for a vector search
        const result = await index.query({
            vector: embedding, // The query vector
            topK: 1, // Number of closest vectors to retrieve
            includeMetadata: true, // Include metadata in the response
        });
        if (result.matches && result.matches.length > 0) {
            const videoMetadata = result.matches[0].metadata;
            return videoMetadata.url; // Assuming URL is stored in metadata
        } else {
            return "No relevant video found.";
        }
    } catch (error) {
        console.error('Error querying Pinecone:', error);
        throw error; // or handle it as needed
    }
}
  
  module.exports = { fetchVideoRecommendation };