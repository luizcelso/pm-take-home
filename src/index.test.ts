import request from 'supertest';
import app from './index';

describe('Express App', () => {
  it('should return welcome message on root route', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Welcome to the Dynamic Knowledge Base System API');
  });
}); 