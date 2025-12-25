# 🚀 SocialApp - Full-Stack Social Media Platform

A modern, scalable social media application built with TypeScript, featuring real-time messaging, secure authentication, RESTful and GraphQL APIs, and comprehensive social features.

## ✨ Features

- 🔐 **User Authentication & Authorization** - JWT-based authentication with email verification (OTP)
- 💬 **Real-Time Messaging** - WebSocket-powered chat system using Socket.IO
- 📝 **Posts & Comments** - Full CRUD operations for posts and comments
- 👥 **User Management** - User profiles, friend requests, and social interactions
- 🧠 **GraphQL API** - Flexible GraphQL endpoint for efficient data fetching
- 📁 **File Upload** - AWS S3 integration for media storage
- 🛡️ **Input Validation** - Zod schema validation for type-safe data handling
- 📧 **Email Service** - Nodemailer integration for notifications and OTP delivery
- 🏗️ **Clean Architecture** - Modular design with separation of concerns

## 🧰 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.9
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Real-Time**: Socket.IO
- **API**: RESTful + GraphQL
- **Validation**: Zod
- **File Storage**: AWS S3 SDK
- **Email**: Nodemailer

### Development
- TypeScript for type safety
- Strict TypeScript configuration
- Modular architecture

## 📁 Project Structure

```
SocialApp/
├── src/
│   ├── bootstrap.ts              # Application initialization
│   ├── index.ts                  # Entry point
│   ├── DB/
│   │   ├── config/
│   │   │   └── connectDB.ts      # MongoDB connection
│   │   ├── models/               # Mongoose models
│   │   │   ├── user.model.ts
│   │   │   ├── post.model.ts
│   │   │   ├── comment.model.ts
│   │   │   ├── chat.model.ts
│   │   │   └── friendReq.model.ts
│   │   └── repos/                # Repository pattern
│   │       ├── DBRepo.ts         # Base repository
│   │       ├── user.repo.ts
│   │       ├── post.repo.ts
│   │       ├── comment.repo.ts
│   │       ├── chat.repo.ts
│   │       └── friendReq.repo.ts
│   ├── modules/                  # Feature modules
│   │   ├── authModule/           # Authentication
│   │   ├── userModule/           # User management
│   │   ├── postModule/           # Posts
│   │   ├── commentModule/        # Comments
│   │   ├── chatModule/           # Real-time chat
│   │   ├── graphql/              # GraphQL schema
│   │   └── routes.ts             # API routes
│   ├── middleware/
│   │   ├── authorization.ts      # JWT middleware
│   │   └── validation.ts         # Request validation
│   ├── gateway/
│   │   └── gateway.ts            # Socket.IO gateway
│   └── utils/
│       ├── AppError.ts           # Error handling
│       ├── successHandler.ts     # Response formatting
│       ├── security/
│       │   ├── hash.ts           # Password hashing
│       │   └── token.ts         # JWT utilities
│       ├── email/                # Email services
│       └── multer/               # File upload (S3)
└── dist/                         # Compiled JavaScript
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- AWS S3 bucket (for file storage)
- Email service credentials (for OTP)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/enisar25/SocialApp.git
   cd SocialApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory:
   ```env
   # Server
   PORT=3000
   
   # Database
   DB_HOST=mongodb://localhost:27017/socialapp
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_bucket_name
   
   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   Or for development with watch mode:
   ```bash
   npm run dev  # Compiles TypeScript in watch mode
   # Then in another terminal:
   npm start    # Runs the server with watch mode
   ```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - Verify email OTP
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users (`/users`)
- `GET /users` - Get all users (with pagination)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user
- `POST /users/:id/friend-request` - Send friend request
- `GET /users/:id/friends` - Get user's friends

### Posts (`/posts`)
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create new post
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Comments (`/comments`)
- `GET /comments` - Get all comments
- `GET /comments/:id` - Get comment by ID
- `POST /comments` - Create new comment
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Chat (`/chat`)
- `GET /chat` - Get chat conversations
- `GET /chat/:id` - Get chat messages
- `POST /chat` - Create new chat

### GraphQL
- `POST /graphql` - GraphQL endpoint

## 🔌 WebSocket Events

The application uses Socket.IO for real-time communication. Connect to the WebSocket server and listen for:

- **Chat Events**: Real-time messaging
- **User Status**: Online/offline status updates
- **Notifications**: Real-time notifications

## 🏗️ Architecture

### Design Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **DTO Pattern**: Data transfer objects for validation
- **Middleware Pattern**: Request/response processing

### Module Structure
Each feature module follows a consistent structure:
```
moduleName/
├── module.controller.ts    # Route handlers
├── module.services.ts      # Business logic
├── module.DTO.ts          # Data transfer objects
└── module.validation.ts   # Zod schemas
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation with Zod
- CORS configuration
- Error handling middleware
- Secure file upload handling

## 📝 Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for TypeScript compilation
- `npm start` - Start the server (with watch mode)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 👤 Author

Mohammed Enisar

---

⭐ If you find this project helpful, please consider giving it a star!
