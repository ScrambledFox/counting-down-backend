# Countdown Backend

A TypeScript/Express.js backend API for the **Countdown** project - a personal website for couples to track time until they're together again, share photos, manage todo lists, and more.

## 🎯 Project Overview

Countdown is a relationship-focused web application that helps couples stay connected by providing:
- **Countdown Timer**: Track days, hours, and minutes until you're reunited
- **Photo Gallery**: Share and view precious memories together
- **Todo Lists**: Manage shared tasks and personal goals
- **Personal Dashboard**: A centralized place for relationship milestones

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Development Tools**: 
  - nodemon (auto-reload during development)
  - ESLint (code linting)
  - Prettier (code formatting)
  - ts-node (TypeScript execution)

## 📁 Project Structure

```
src/
├── app.ts              # Express app configuration
├── server.ts           # Server entry point
├── config/
│   └── config.ts       # Application configuration
├── controllers/        # Route handlers and business logic
├── middlewares/        # Custom middleware functions
├── models/            # Data models and interfaces
│   └── todo-item.ts   # Todo item model
└── routes/            # API route definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd counting-down-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development

Start the development server with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured port).

### Production

Build and start the production server:
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Todo Items
- `GET /api/todos` - Get all todo items
- `POST /api/todos` - Create a new todo item
- `PUT /api/todos/:id` - Update a todo item
- `DELETE /api/todos/:id` - Delete a todo item

### Countdown
- `GET /api/countdown` - Get countdown information
- `POST /api/countdown` - Set/update countdown date

### Photos
- `GET /api/photos` - Get photo gallery
- `POST /api/photos` - Upload new photos
- `DELETE /api/photos/:id` - Delete a photo

*Note: Full API documentation coming soon*

## 🔧 Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret for authentication tokens

## 📝 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💕 About

Created with love for tracking precious moments and staying connected across distances. Every feature is designed to bring couples closer together, no matter how far apart they may be.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

*Built with TypeScript and Express.js* ❤️