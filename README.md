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
├── src/                  # Source code
│   ├── index.ts          # Application entry point
│   └── index.test.ts     # Tests
├── dist/                 # Compiled JavaScript files
├── .env.example          # Example environment variables
├── .eslintrc.json        # ESLint configuration
├── .gitignore            # Git ignore file
├── jest.config.js        # Jest configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## License

ISC