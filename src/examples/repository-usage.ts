import { TopicRepository } from '../repositories/TopicRepository';
import { ResourceRepository } from '../repositories/ResourceRepository';
import { UserRepository } from '../repositories/UserRepository';
import { Topic } from '../models/Topic';
import { Resource } from '../models/Resource';
import { ResourceType } from '../enums/ResourceType';
import { UserRole } from '../enums/UserRole';

/**
 * Example of how to use the repositories
 */
async function main(): Promise<void> {
  try {
    // Create repository instances
    const topicRepo = new TopicRepository();
    const resourceRepo = new ResourceRepository();
    const userRepo = new UserRepository();

    // Create an admin user
    const admin = await userRepo.createWithPassword(
      'Admin User',
      'admin@example.com',
      'securePassword123',
      UserRole.ADMIN
    );
    console.log('Created admin user:', admin.toJSON());

    // Create a regular user
    const user = await userRepo.createWithPassword(
      'Regular User',
      'user@example.com',
      'userPassword456',
      UserRole.VIEWER
    );
    console.log('Created regular user:', user.toJSON());

    // Authenticate a user
    const authenticatedUser = await userRepo.authenticate('admin@example.com', 'securePassword123');
    console.log('Authenticated user:', authenticatedUser ? 'Success' : 'Failed');

    // Create a root topic
    const rootTopic = new Topic('Getting Started', 'Welcome to the knowledge base!');
    await topicRepo.create(rootTopic);
    console.log('Created root topic:', rootTopic.toJSON());

    // Create a child topic
    const childTopic = new Topic(
      'TypeScript Basics',
      'Learn the basics of TypeScript',
      1,
      rootTopic.id
    );
    await topicRepo.create(childTopic);
    console.log('Created child topic:', childTopic.toJSON());

    // Create a resource for the child topic
    const resource = new Resource(
      childTopic.id,
      'https://www.typescriptlang.org/docs/',
      'Official TypeScript Documentation',
      ResourceType.LINK
    );
    await resourceRepo.create(resource);
    console.log('Created resource:', resource.toJSON());

    // Find all root topics
    const rootTopics = await topicRepo.findRootTopics();
    console.log('Root topics:', rootTopics.map(t => t.name));

    // Find child topics of a parent
    const childTopics = await topicRepo.findByParentId(rootTopic.id);
    console.log('Child topics of', rootTopic.name, ':', childTopics.map(t => t.name));

    // Find resources for a topic
    const resources = await resourceRepo.findByTopicId(childTopic.id);
    console.log('Resources for', childTopic.name, ':', resources.map(r => r.description));

    // Create a new version of a topic
    const newVersion = await topicRepo.createNewVersion(
      childTopic.id,
      'Learn the basics of TypeScript - Updated with more information'
    );
    console.log('Created new version of topic:', newVersion?.toJSON());

    // Find all users with a specific role
    const admins = await userRepo.findByRole(UserRole.ADMIN);
    console.log('Admin users:', admins.map(u => u.name));

    console.log('Example completed successfully!');
  } catch (error) {
    console.error('Error in example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main }; 