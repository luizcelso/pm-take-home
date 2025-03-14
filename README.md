# Dynamic Knowledge Base System API

This API manages interconnected topics and resources with version control, user roles, and
permissions

## Features

- TypeScript for type safety
- Express.js for the web server
- Security with Helmet.js
- Environment variables with dotenv
- ESLint for code quality
- Jest for testing
- Secure dependency versions

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Development

Start the development server:

```bash
npm run dev
```

## Building for Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Testing

Run tests:

```bash
npm test
```

## Linting

Check code quality:

```bash
npm run lint
```

## Project Structure

```
.
├── src/                      # Source code
│   ├── controllers/          # Request handlers
│   │   └── TopicController.ts
│   ├── database/             # Database related code
│   ├── enums/                # Enumeration types
│   ├── examples/             # Example code
│   ├── interfaces/           # TypeScript interfaces
│   ├── middleware/           # Express middleware
│   │   └── auth.ts           # Authentication middleware
│   ├── models/               # Data models
│   │   ├── BaseEntity.ts
│   │   ├── Resource.ts
│   │   ├── Topic.ts
│   │   └── User.ts
│   ├── repositories/         # Data access layer
│   │   ├── BaseRepository.ts
│   │   ├── IRepository.ts
│   │   ├── MockUserRepository.ts
│   │   ├── ResourceRepository.ts
│   │   ├── TopicRepository.ts
│   │   └── UserRepository.ts
│   ├── routes/               # API routes
│   │   ├── index.ts          # Central router that combines all routes
│   │   ├── topicRoutes.ts    # Topic-related routes
│   │   ├── userRoutes.ts     # User-related routes (placeholder)
│   │   └── resourceRoutes.ts # Resource-related routes (placeholder)
│   ├── services/             # Business logic
│   │   ├── ITopicService.ts
│   │   ├── SecureTopicService.ts
│   │   ├── TopicService.ts
│   │   └── strategies/       # Strategy pattern implementations
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── index.ts              # Application entry point
│   └── index.test.ts         # Entry point tests
├── dist/                     # Compiled JavaScript files
├── coverage/                 # Test coverage reports
├── node_modules/             # Dependencies
├── .env                      # Environment variables
├── .env.example              # Example environment variables
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore file
├── jest.config.js            # Jest configuration
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Dependency lock file
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## License

ISC

## API Documentation

This section provides information on how to use the Topic Management API.

### Authentication

All API endpoints require authentication. You need to include an `Authorization` header with a Bearer token in your requests.

```
Authorization: Bearer <token>
```

For development purposes, you can use the following tokens:
- Admin user: `admin-id`
- Editor user: `editor-id`
- Viewer user: `viewer-id`

### Endpoints

#### Topics

##### Get All Topics

```
GET /api/topics
```

Returns all topics the authenticated user has permission to view.

##### Get Root Topics

```
GET /api/topics/root
```

Returns all root topics (topics without a parent) the authenticated user has permission to view.

##### Create a Topic

```
POST /api/topics
```

Creates a new topic. Requires Admin or Editor role.

Request body:
```json
{
  "name": "Topic Name",
  "content": "Topic Content",
  "parentTopicId": "optional-parent-id"
}
```

##### Get a Topic by ID

```
GET /api/topics/:id
```

Returns a specific topic by ID if the authenticated user has permission to view it.

##### Update a Topic

```
PUT /api/topics/:id
```

Updates a topic. Requires Admin or Editor role.

Request body:
```json
{
  "content": "Updated Content",
  "name": "Optional Updated Name"
}
```

##### Delete a Topic

```
DELETE /api/topics/:id
```

Deletes a topic. Requires Admin role. Cannot delete topics with children.

##### Get Child Topics

```
GET /api/topics/:parentId/children
```

Returns all child topics of a parent topic if the authenticated user has permission to view them.

##### Get Topic Tree

```
GET /api/topics/:id/tree
```

Returns a topic tree (the topic and all its children recursively) if the authenticated user has permission to view it.

### Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "message": "Error message",
  "error": "Detailed error information (in development mode)"
}
```

### Role-Based Access Control

- **Admin**: Can create, read, update, and delete any topic
- **Editor**: Can create, read, and update topics, but cannot delete them
- **Viewer**: Can only read topics

## Route Organization

The API routes are organized in a modular way to improve maintainability and scalability:

1. **Individual Route Files**: Each resource type has its own route file:
   - `topicRoutes.ts`: Contains all topic-related endpoints
   - `userRoutes.ts`: Placeholder for future user-related endpoints
   - `resourceRoutes.ts`: Placeholder for future resource-related endpoints

2. **Central Router**: The `routes/index.ts` file combines all resource routes and exports them as a single router.

3. **API Prefix**: All routes are mounted under the `/api` prefix in the main application.

To add new routes:
1. Create a controller for the resource
2. Implement the routes in the corresponding route file
3. Mount the routes in the `routes/index.ts` file