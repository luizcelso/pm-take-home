import fs from 'fs/promises';
import path from 'path';
import { JsonDatabase } from '../JsonDatabase';
import { Topic } from '../../models/Topic';

// Mock fs module
jest.mock('fs/promises');

describe('JsonDatabase', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const testDataDir = path.join(process.cwd(), 'test-data');
  const testFilePath = path.join(testDataDir, 'topic.json');
  
  let database: JsonDatabase<Topic>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the mkdir function
    mockFs.mkdir.mockResolvedValue(undefined);
    
    // Create a new database instance for each test
    database = new JsonDatabase<Topic>('Topic', testDataDir);
  });
  
  it('should initialize and create a file if it does not exist', async () => {
    // Mock the readFile function to throw ENOENT error
    const error = new Error('File not found') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    mockFs.readFile.mockRejectedValue(error);
    
    // Mock the writeFile function
    mockFs.writeFile.mockResolvedValue(undefined);
    
    // Call a method that triggers initialization
    await database.findAll();
    
    // Verify that mkdir was called
    expect(mockFs.mkdir).toHaveBeenCalledWith(testDataDir, { recursive: true });
    
    // Verify that readFile was called
    expect(mockFs.readFile).toHaveBeenCalledWith(testFilePath, 'utf-8');
    
    // Verify that writeFile was called with an empty array
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      testFilePath,
      JSON.stringify([], null, 2),
      'utf-8'
    );
  });
  
  it('should load existing data from file', async () => {
    // Mock the readFile function to return existing data
    const mockTopics = [
      {
        id: 'topic-1',
        name: 'Test Topic',
        content: 'Test Content',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    mockFs.readFile.mockResolvedValue(JSON.stringify(mockTopics));
    
    // Call findAll to trigger initialization and get the data
    const topics = await database.findAll();
    
    // Verify that readFile was called
    expect(mockFs.readFile).toHaveBeenCalledWith(testFilePath, 'utf-8');
    
    // Verify that the data was loaded correctly
    expect(topics).toHaveLength(1);
    expect(topics[0].id).toBe('topic-1');
    expect(topics[0].name).toBe('Test Topic');
  });
  
  it('should create a new entity', async () => {
    // Mock the readFile function to return empty data
    mockFs.readFile.mockResolvedValue(JSON.stringify([]));
    
    // Mock the writeFile function
    mockFs.writeFile.mockResolvedValue(undefined);
    
    // Create a new topic
    const topic = new Topic('New Topic', 'New Content');
    
    // Create the topic in the database
    const createdTopic = await database.create(topic);
    
    // Verify that writeFile was called with the new topic
    expect(mockFs.writeFile).toHaveBeenCalled();
    const writeFileCall = mockFs.writeFile.mock.calls[0];
    const writtenData = JSON.parse(writeFileCall[1] as string);
    
    // Verify that the data was written correctly
    expect(writtenData).toHaveLength(1);
    expect(writtenData[0].id).toBe(topic.id);
    expect(writtenData[0].name).toBe('New Topic');
    
    // Verify that the created topic is returned
    expect(createdTopic).toBe(topic);
  });
  
  it('should update an existing entity', async () => {
    // Create a topic
    const topic = new Topic('Original Topic', 'Original Content');
    
    // Mock the readFile function to return the topic
    mockFs.readFile.mockResolvedValue(JSON.stringify([topic]));
    
    // Mock the writeFile function
    mockFs.writeFile.mockResolvedValue(undefined);
    
    // Create an updated version of the topic
    const updatedTopic = topic.createNewVersion('Updated Content');
    
    // Update the topic in the database
    const result = await database.update(topic.id, updatedTopic);
    
    // Verify that writeFile was called with the updated topic
    expect(mockFs.writeFile).toHaveBeenCalled();
    const writeFileCall = mockFs.writeFile.mock.calls[0];
    const writtenData = JSON.parse(writeFileCall[1] as string);
    
    // Verify that the data was written correctly
    expect(writtenData).toHaveLength(1);
    expect(writtenData[0].id).toBe(topic.id);
    expect(writtenData[0].content).toBe('Updated Content');
    expect(writtenData[0].version).toBe(2);
    
    // Verify that the updated topic is returned
    expect(result).toBe(updatedTopic);
  });
  
  it('should delete an entity', async () => {
    // Create a topic
    const topic = new Topic('Topic to Delete', 'Content');
    
    // Mock the readFile function to return the topic
    mockFs.readFile.mockResolvedValue(JSON.stringify([topic]));
    
    // Mock the writeFile function
    mockFs.writeFile.mockResolvedValue(undefined);
    
    // Delete the topic from the database
    const result = await database.delete(topic.id);
    
    // Verify that writeFile was called with an empty array
    expect(mockFs.writeFile).toHaveBeenCalled();
    const writeFileCall = mockFs.writeFile.mock.calls[0];
    const writtenData = JSON.parse(writeFileCall[1] as string);
    
    // Verify that the data was written correctly
    expect(writtenData).toHaveLength(0);
    
    // Verify that true is returned
    expect(result).toBe(true);
  });
  
  it('should query entities based on a predicate', async () => {
    // Create topics
    const topic1 = new Topic('Topic 1', 'Content 1');
    const topic2 = new Topic('Topic 2', 'Content 2');
    const topic3 = new Topic('Different', 'Content 3');
    
    // Mock the readFile function to return the topics
    mockFs.readFile.mockResolvedValue(JSON.stringify([topic1, topic2, topic3]));
    
    // Query topics that have 'Topic' in their name
    const results = await database.query(topic => topic.name.includes('Topic'));
    
    // Verify that the correct topics are returned
    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Topic 1');
    expect(results[1].name).toBe('Topic 2');
  });
}); 