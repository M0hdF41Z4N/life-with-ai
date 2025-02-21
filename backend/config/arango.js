import { Database } from "arangojs";
import { logger } from "../utils/logger.js";
import dotenv from 'dotenv';
dotenv.config();

const {
  ARANGO_URL = 'http://localhost:8529',
  ARANGO_DB = 'lifeWithAI',
  ARANGO_USER = 'root',
  ARANGO_PASSWORD = 'password'
} = process.env;

// Database connection instance
let db;

// Collection names
const collections = {
  tasks: 'tasks',
  emails: 'emails',
  documents: 'documents',
  relationships: 'relationships'
};

// Initialize database connection
async function connectDB() {
  try {
    console.log(ARANGO_URL,ARANGO_USER,ARANGO_PASSWORD);
    db = new Database({
      url: ARANGO_URL,
      // databaseName: ARANGO_DB,
      auth: {
        username: ARANGO_USER,
        password: ARANGO_PASSWORD
      }
    });

    // Test connection
    await db.version();
    logger.info('Connected to ArangoDB');

    // Ensure collections exist
    await initializeCollections();

    return db;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

// Initialize collections
async function initializeCollections() {
  try {
    // Create collections if they don't exist
    for (const [name, collection] of Object.entries(collections)) {
      const exists = await db.collection(collection).exists();
      if (!exists) {
        await db.createCollection(collection);
        logger.info(`Created collection: ${collection}`);
      }
    }

    // Create indexes
    await createIndexes();
  } catch (error) {
    logger.error('Failed to initialize collections:', error);
    throw error;
  }
}

// Create necessary indexes
async function createIndexes() {
  try {
    // Tasks collection indexes
    await db.collection(collections.tasks).ensureIndex({
      type: 'persistent',
      fields: ['userId', 'deadline']
    });

    // Emails collection indexes
    await db.collection(collections.emails).ensureIndex({
      type: 'persistent',
      fields: ['userId', 'timestamp']
    });

    // Relationships collection indexes
    await db.collection(collections.relationships).ensureIndex({
      type: 'persistent',
      fields: ['_from', '_to']
    });

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create indexes:', error);
    throw error;
  }
}

// Health check function
async function checkDatabaseHealth() {
  try {
    if (!db) {
      return { status: 'error', message: 'Database not initialized' };
    }

    await db.version();
    return { status: 'healthy', message: 'Database connection is active' };
  } catch (error) {
    return { 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    };
  }
}
const getDB = () => db;

export {
  connectDB,
  getDB,
  collections,
  checkDatabaseHealth
};