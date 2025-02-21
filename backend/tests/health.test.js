import request from 'supertest';
import app from '../app.js';
import { checkDatabaseHealth } from '../config/arango.js';

// Mock database health check
jest.mock('../config/arango.js', () => ({
  checkDatabaseHealth: jest.fn()
}));

describe('Health Check Endpoints', () => {
  beforeEach(() => {
    // Reset mock before each test
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 when all systems are healthy', async () => {
      // Mock healthy database response
      checkDatabaseHealth.mockResolvedValue({
        status: 'healthy',
        message: 'Database connection is active'
      });

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          version: expect.any(String),
          uptime: expect.any(Number),
          environment: expect.any(String),
          database: expect.objectContaining({
            status: 'healthy',
            message: expect.any(String)
          }),
          memory: expect.objectContaining({
            used: expect.any(Number),
            total: expect.any(Number),
            unit: 'MB'
          })
        })
      );
    });

    it('should return 503 when database is unhealthy', async () => {
      // Mock unhealthy database response
      checkDatabaseHealth.mockResolvedValue({
        status: 'error',
        message: 'Database connection failed'
      });

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body.database).toEqual(
        expect.objectContaining({
          status: 'error',
          message: 'Database connection failed'
        })
      );
    });

    it('should include all required health check properties', async () => {
      checkDatabaseHealth.mockResolvedValue({
        status: 'healthy',
        message: 'Database connection is active'
      });

      const response = await request(app).get('/health');

      const requiredProperties = [
        'status',
        'timestamp',
        'version',
        'uptime',
        'environment',
        'database',
        'memory'
      ];

      requiredProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });

      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.memory).toHaveProperty('unit');
    });
  });

  describe('GET /api-docs', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api-docs');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          version: expect.any(String),
          endpoints: expect.objectContaining({
            '/health': expect.any(String),
            '/api/tasks': expect.any(String),
            '/api/emails': expect.any(String)
          })
        })
      );
    });
  });
});