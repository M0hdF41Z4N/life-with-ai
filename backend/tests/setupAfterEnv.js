
import { connectDB } from '../config/arango.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  // Clean up database connections
  const db = global.__MONGO_CLIENT__;
  if (db) {
    await db.close();
  }
});