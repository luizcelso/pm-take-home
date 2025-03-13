import { Topic } from '../Topic';

describe('Topic', () => {
  it('should create a valid topic', () => {
    const topic = new Topic('Test Topic', 'This is a test topic');
    
    expect(topic.id).toBeDefined();
    expect(topic.name).toBe('Test Topic');
    expect(topic.content).toBe('This is a test topic');
    expect(topic.version).toBe(1);
    expect(topic.createdAt).toBeInstanceOf(Date);
    expect(topic.updatedAt).toBeInstanceOf(Date);
    expect(topic.parentTopicId).toBeUndefined();
  });

  it('should create a topic with a parent', () => {
    const parentId = 'parent-id';
    const topic = new Topic('Child Topic', 'This is a child topic', 1, parentId);
    
    expect(topic.parentTopicId).toBe(parentId);
  });

  it('should validate a topic', () => {
    const topic = new Topic('Test Topic', 'This is a test topic');
    
    expect(() => topic.validate()).not.toThrow();
  });

  it('should throw an error for invalid topic name', () => {
    const topic = new Topic('', 'This is a test topic');
    
    expect(() => topic.validate()).toThrow('Topic name cannot be empty');
  });

  it('should throw an error for invalid topic content', () => {
    const topic = new Topic('Test Topic', '');
    
    expect(() => topic.validate()).toThrow('Topic content cannot be empty');
  });

  it('should throw an error for invalid topic version', () => {
    const topic = new Topic('Test Topic', 'This is a test topic', 0);
    
    expect(() => topic.validate()).toThrow('Topic version must be at least 1');
  });

  it('should create a new version of a topic', () => {
    const topic = new Topic('Test Topic', 'This is a test topic');
    const newContent = 'This is updated content';
    
    const newVersion = topic.createNewVersion(newContent);
    
    expect(newVersion.id).toBe(topic.id);
    expect(newVersion.name).toBe(topic.name);
    expect(newVersion.content).toBe(newContent);
    expect(newVersion.version).toBe(2);
    expect(newVersion.createdAt).toBe(topic.createdAt);
    expect(newVersion.updatedAt).not.toBe(topic.updatedAt);
  });

  it('should convert to JSON correctly', () => {
    const topic = new Topic('Test Topic', 'This is a test topic');
    const json = topic.toJSON();
    
    expect(json.id).toBe(topic.id);
    expect(json.name).toBe('Test Topic');
    expect(json.content).toBe('This is a test topic');
    expect(json.version).toBe(1);
    expect(json.createdAt).toBe(topic.createdAt.toISOString());
    expect(json.updatedAt).toBe(topic.updatedAt.toISOString());
    expect(json.parentTopicId).toBeUndefined();
  });
}); 