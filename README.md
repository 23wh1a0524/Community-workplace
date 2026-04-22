# Community Insight

Community Insight is a full-stack MERN-based web application for residential community issue management. Residents can register, log in, report problems, upload attachments, vote on issues, and track progress. Admins can monitor issue trends, update statuses, and view analytics.

## Features

- User authentication with JWT
- Resident and admin roles
- Issue reporting with file attachments
- Vote-based issue prioritization
- Personal issue tracking
- Admin analytics dashboard
- Status-based workflow for issue resolution
- Responsive React frontend with protected routes

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT
- File Uploads: Multer

## Project Structure

```text
community_insight/
|-- backend/
|   |-- src/
|   |-- scripts/
|   |-- seed.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |-- index.html
|   |-- vite.config.js
|   `-- package.json
`-- README.md
```

## Modules

### Resident

- Register and log in
- View dashboard
- Create issues
- Upload up to 5 attachments per issue
- Vote on issues
- Track own submitted issues
- Update profile

### Admin

- Access analytics dashboard
- Review issue trends
- Track open, in-progress, and resolved issues
- Update issue status

## Local Setup

### Prerequisites

- Node.js
- MongoDB running locally

### 1. Clone the repository

```bash
git clone https://github.com/23wh1a0524/Community-workplace.git
cd Community-workplace
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/community-insight
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

Backend runs at:

```text
http://localhost:5000
```

## Seed Demo Data

To add sample users and issues:

```bash
cd backend
node seed.js
```

### Demo Accounts

- Admin: `kavya@sunriseheights.in` / `admin123`
- Resident: `pradeepthi@sunriseheights.in` / `resident123`

## API Overview

Base API path:

```text
/api/v1
```

Main endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/issues`
- `POST /api/v1/issues`
- `GET /api/v1/issues/my`
- `PUT /api/v1/issues/:id`
- `POST /api/v1/issues/:id/vote`
- `DELETE /api/v1/issues/:id`
- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`
- `GET /api/v1/analytics`

## Screens Included

- Login
- Register
- Dashboard
- Issues
- My Issues
- Notifications
- Profile
- Analytics

## Demo Video

Add your project execution video link here after uploading it:

```text
Demo Video: <https://drive.google.com/file/d/1uv36SEdT7JdGg7vtnWfbYyxWY6gr_kT2/view?usp=drive_link>
```

## Future Improvements

- Email notifications
- Real-time issue updates
- Better admin assignment workflow
- Search and advanced filters
- Deployment with cloud database and storage

## Author

Developed as a community issue tracking and analytics project using the MERN stack.
