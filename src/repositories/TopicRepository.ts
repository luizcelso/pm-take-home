import { BaseRepository } from './BaseRepository';
import { Topic } from '../models/Topic';

/**
 * Repository for Topic entities
 */
export class TopicRepository extends BaseRepository<Topic> {
  /**
   * Creates a new TopicRepository instance
   */
  constructor() {
    super('Topic');
  }

  /**
   * Finds topics by parent topic ID
   * @param parentTopicId The ID of the parent topic
   * @returns Promise resolving to an array of child topics
   */
  public async findByParentId(parentTopicId: string): Promise<Topic[]> {
    return this.query(topic => topic.parentTopicId === parentTopicId);
  }

  /**
   * Finds root topics (topics without a parent)
   * @returns Promise resolving to an array of root topics
   */
  public async findRootTopics(): Promise<Topic[]> {
    return this.query(topic => !topic.parentTopicId);
  }

  /**
   * Finds topics by name (case-insensitive partial match)
   * @param name The name to search for
   * @returns Promise resolving to an array of matching topics
   */
  public async findByName(name: string): Promise<Topic[]> {
    const lowerName = name.toLowerCase();
    return this.query(topic => topic.name.toLowerCase().includes(lowerName));
  }

  /**
   * Creates a new version of a topic
   * @param id The ID of the topic to version
   * @param newContent The new content for the topic
   * @param newName Optional new name for the topic
   * @returns Promise resolving to the new version of the topic
   */
  public async createNewVersion(
    id: string, 
    newContent: string, 
    newName?: string
  ): Promise<Topic | null> {
    const topic = await this.findById(id);
    
    if (!topic) {
      return null;
    }
    
    const newVersion = topic.createNewVersion(newContent, newName);
    
    // Save the new version
    await this.create(newVersion);
    
    return newVersion;
  }

  /**
   * Finds all versions of a topic
   * @param rootTopicId The ID of the root topic
   * @returns Promise resolving to an array of all versions of the topic
   */
  public async findAllVersions(rootTopicId: string): Promise<Topic[]> {
    return this.query(topic => topic.rootTopicId === rootTopicId);
  }

  /**
   * Finds a specific version of a topic
   * @param rootTopicId The ID of the root topic
   * @param version The version number to find
   * @returns Promise resolving to the specific version of the topic
   */
  public async findVersion(rootTopicId: string, version: number): Promise<Topic | null> {
    const versions = await this.findAllVersions(rootTopicId);
    return versions.find(topic => topic.version === version) || null;
  }

  /**
   * Finds the latest version of a topic
   * @param rootTopicId The ID of the root topic
   * @returns Promise resolving to the latest version of the topic
   */
  public async findLatestVersion(rootTopicId: string): Promise<Topic | null> {
    const versions = await this.findAllVersions(rootTopicId);
    
    if (versions.length === 0) {
      return null;
    }
    
    // Sort by version number in descending order
    versions.sort((a, b) => b.version - a.version);
    
    return versions[0];
  }

  /**
   * Creates a child topic
   * @param parentId The ID of the parent topic
   * @param name The name of the child topic
   * @param content The content of the child topic
   * @returns Promise resolving to the created child topic
   */
  public async createChildTopic(
    parentId: string,
    name: string,
    content: string
  ): Promise<Topic | null> {
    const parentTopic = await this.findById(parentId);
    
    if (!parentTopic) {
      return null;
    }
    
    const childTopic = parentTopic.createChildTopic(name, content);
    return this.create(childTopic);
  }

  /**
   * Finds all child topics recursively
   * @param topicId The ID of the parent topic
   * @returns Promise resolving to an array of all child topics
   */
  public async findAllChildrenRecursive(topicId: string): Promise<Topic[]> {
    const result: Topic[] = [];
    await this.findChildrenRecursive(topicId, result);
    return result;
  }

  /**
   * Helper method to recursively find child topics
   * @param topicId The ID of the parent topic
   * @param result Array to collect the results
   */
  private async findChildrenRecursive(topicId: string, result: Topic[]): Promise<void> {
    const children = await this.findByParentId(topicId);
    
    for (const child of children) {
      result.push(child);
      await this.findChildrenRecursive(child.id, result);
    }
  }

  /**
   * Finds the path between two topics
   * @param startTopicId The ID of the start topic
   * @param endTopicId The ID of the end topic
   * @returns Promise resolving to an array of topics representing the path
   */
  public async findPath(startTopicId: string, endTopicId: string): Promise<Topic[] | null> {
    const startTopic = await this.findById(startTopicId);
    const endTopic = await this.findById(endTopicId);
    
    if (!startTopic || !endTopic) {
      return null;
    }
    
    // Get all topics to build the graph
    const allTopics = await this.findAll();
    
    // Build a graph representation
    const graph = new Map<string, string[]>();
    
    for (const topic of allTopics) {
      if (!graph.has(topic.id)) {
        graph.set(topic.id, []);
      }
      
      // Add parent-child relationships
      if (topic.parentTopicId) {
        // Add edge from parent to child
        if (!graph.has(topic.parentTopicId)) {
          graph.set(topic.parentTopicId, []);
        }
        graph.get(topic.parentTopicId)?.push(topic.id);
        
        // Add edge from child to parent
        graph.get(topic.id)?.push(topic.parentTopicId);
      }
    }
    
    // Find the shortest path using BFS
    const path = this.findShortestPath(graph, startTopicId, endTopicId);
    
    if (!path) {
      return null;
    }
    
    // Convert path of IDs to path of Topics
    const result: Topic[] = [];
    for (const id of path) {
      const topic = allTopics.find(t => t.id === id);
      if (topic) {
        result.push(topic);
      }
    }
    
    return result;
  }

  /**
   * Finds the shortest path between two nodes in a graph using BFS
   * @param graph The graph representation
   * @param startId The ID of the start node
   * @param endId The ID of the end node
   * @returns An array of node IDs representing the path, or null if no path exists
   */
  private findShortestPath(
    graph: Map<string, string[]>,
    startId: string,
    endId: string
  ): string[] | null {
    // Queue for BFS
    const queue: string[] = [startId];
    
    // Map to track visited nodes and their predecessors
    const visited = new Map<string, string | null>();
    visited.set(startId, null);
    
    // BFS to find the shortest path
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      // If we've reached the end node, reconstruct the path
      if (currentId === endId) {
        return this.reconstructPath(visited, startId, endId);
      }
      
      // Visit all neighbors
      const neighbors = graph.get(currentId) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.set(neighborId, currentId);
          queue.push(neighborId);
        }
      }
    }
    
    // No path found
    return null;
  }

  /**
   * Reconstructs the path from the visited map
   * @param visited Map of visited nodes and their predecessors
   * @param startId The ID of the start node
   * @param endId The ID of the end node
   * @returns An array of node IDs representing the path
   */
  private reconstructPath(
    visited: Map<string, string | null>,
    startId: string,
    endId: string
  ): string[] {
    const path: string[] = [endId];
    let current = endId;
    
    while (current !== startId) {
      const predecessor = visited.get(current);
      
      if (!predecessor) {
        break;
      }
      
      path.unshift(predecessor);
      current = predecessor;
    }
    
    return path;
  }
} 