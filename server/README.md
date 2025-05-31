
# CR Tracker Backend

A Node.js/Express backend for the Change Request Tracker application with Supabase integration.

## 🏗️ Project Structure

```
server/
├── controllers/         # Business logic controllers
│   ├── crController.js     # Change Request operations
│   ├── taskController.js   # Task operations
│   └── userController.js   # User operations
├── db/                  # Database configuration
│   ├── supabase.js        # Supabase client setup
│   └── schema.sql         # Database schema
├── routes/             # API route definitions
│   ├── crRoutes.js        # CR endpoints
│   ├── taskRoutes.js      # Task endpoints
│   └── userRoutes.js      # User endpoints
├── scripts/            # Utility scripts
│   └── seedData.js        # Mock data seeding
├── validators/         # Request validation schemas
│   └── crValidators.js    # Joi validation schemas
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
├── server.js          # Main application entry point
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Supabase account and project

### 1. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5000
   NODE_ENV=development
   ```

### 2. Database Setup

1. In your Supabase dashboard, go to SQL Editor
2. Run the SQL schema from `db/schema.sql` to create tables
3. This will create:
   - `users` table
   - `change_requests` table
   - `cr_developers` table (many-to-many)
   - `tasks` table

### 3. Install Dependencies

```bash
cd server
npm install
```

### 4. Seed Sample Data

```bash
npm run seed
```

This creates 10 sample users, 5 change requests, and associated tasks.

### 5. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server runs on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Change Requests
- `GET /api/crs` - Get all change requests
- `GET /api/crs/user/:userId` - Get CRs for specific user
- `POST /api/crs` - Create new change request
- `PATCH /api/crs/:crId/status` - Update CR status

### Tasks
- `GET /api/tasks/cr/:crId` - Get tasks for specific CR
- `PATCH /api/tasks/:taskId/status` - Update task status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

## 🧪 Testing the API

### Using curl:

1. **Get all CRs:**
   ```bash
   curl http://localhost:5000/api/crs
   ```

2. **Create a new CR:**
   ```bash
   curl -X POST http://localhost:5000/api/crs \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test CR",
       "description": "Test description",
       "owner_id": "user-uuid-here",
       "assigned_developers": ["user-uuid-1", "user-uuid-2"],
       "due_date": "2024-03-01"
     }'
   ```

3. **Update CR status:**
   ```bash
   curl -X PATCH http://localhost:5000/api/crs/cr-uuid/status \
     -H "Content-Type: application/json" \
     -d '{"status": "in-progress"}'
   ```

### Using a tool like Postman or Insomnia:

Import the following collection for easy testing:

```json
{
  "name": "CR Tracker API",
  "requests": [
    {
      "name": "Get All CRs",
      "method": "GET",
      "url": "http://localhost:5000/api/crs"
    },
    {
      "name": "Get User CRs",
      "method": "GET",
      "url": "http://localhost:5000/api/crs/user/{{userId}}"
    },
    {
      "name": "Create CR",
      "method": "POST",
      "url": "http://localhost:5000/api/crs",
      "body": {
        "title": "New CR",
        "description": "Description",
        "owner_id": "{{userId}}",
        "assigned_developers": ["{{userId}}"],
        "due_date": "2024-03-01"
      }
    }
  ]
}
```

## 🔒 Security Features

- Request validation using Joi
- CORS configuration
- Environment variable protection
- SQL injection prevention (Supabase handles this)
- Input sanitization

## 🐛 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (development only)"
}
```

## 🚀 Deployment on Replit

1. Import this backend code to a new Replit
2. Set environment variables in Replit Secrets
3. The server will automatically run on port 5000
4. Update your frontend API base URL to point to your Replit backend

## 📚 Additional Notes

- All timestamps are in ISO 8601 format
- UUIDs are used for all primary keys
- The API supports both JSON and URL-encoded requests
- Comprehensive logging for debugging
- Development vs production environment handling
