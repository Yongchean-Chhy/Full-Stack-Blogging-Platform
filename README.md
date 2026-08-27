# Adventure Stories
 
A full-stack blogging platform where users discover, write, and discuss outdoor adventures — hiking, camping, and travel experiences. Built with Node.js, Express, MySQL, and Pug.

## Table of Contents
 
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [User Flows](#user-flows)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)
- [What I Learned](#what-i-learned)
- [License](#license)

## Features
| | |
|---|---|
| **Authentication** | Registration, login/logout, session-based auth, password hashing with `bcrypt` |
| **Blog Posts** | Create and publish posts, view individual posts with author + publish date, browse recent adventures |
| **Comments** | Authenticated users can comment; admins can delete comments |
| **Dashboard** | Browse all published posts, ordered by date, with pagination |
| **Server-Side Rendering** | Pug templates, custom CSS, client-side JS for form handling and interactions |
| **MySQL Database** | Relational schema linking users, posts, and comments |
 
## Tech Stack
 
| Layer | Technologies |
|---|---|
| Backend | Node.js, Express.js, Express Session, bcrypt |
| Database | MySQL, MySQL2 |
| Frontend | Pug, HTML, CSS, JavaScript |

## Project Structure
 
```text
BlogProject/
├── server.js                 # Express application and API routes
├── data.js                   # Database queries and data access layer
├── package.json              # Project dependencies and scripts
├── package-lock.json
│
└── resources/
    ├── database/
    │   └── schema.sql        # Database schema
    │
    ├── css/
    │   └── main.css          # Application styling
    │
    ├── js/
    │   ├── create.js         # Blog and comment functionality
    │   ├── delete.js         # Admin comment deletion
    │   ├── frontend.js       # Frontend UI behavior
    │   └── log_reg.js        # Login and registration
    │
    ├── templates/
    │   ├── layout.pug
    │   ├── about.pug
    │   ├── login.pug
    │   ├── dashboard.pug
    │   ├── create.pug
    │   ├── blog.pug
    │   └── 404.pug
    │
    └── images/
        └── ...                # Application images
```

## Architecture
 
```text
Browser
   │
   ▼
Pug Templates / Client-side JS
   │
   ▼
Express Server
   ├── Authentication
   ├── Session Management
   ├── Blog Routes
   ├── Comment Routes
   └── Authorization
   │
   ▼
Data Access Layer (data.js)
   │
   ▼
MySQL Database
```
 
**Example request flow — creating a blog post:**
 
```text
Blog form submitted
   → Client-side JS
   → POST /api/create_blog
   → Express authentication check
   → add_to_blog()
   → MySQL
   → Redirect to dashboard
```

## Authentication & Authorization
 
Authentication uses **Express sessions**. Passwords are hashed with `bcrypt` before storage and compared on login:
 
```javascript
// On registration
const hashedPass = await bcrypt.hash(data.password, 10);
 
// On login
const match = await bcrypt.compare(data.password, user_info.password_hash);
 
// On successful login
req.session.user = {
  id: user_info.id,
  username: user_info.username,
  is_admin: user_info.is_admin
};
```
 
**Access levels:**
 
| Role | Can do |
|---|---|
| Regular user | Create posts, comment, browse posts, log out |
| Administrator | All of the above, plus delete comments |
 
Admin routes are protected with middleware:
 
```javascript
function require_admin(req, res, next) {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).json({
      status: "error",
      errors: ["Admin access required"]
    });
  }
  next();
}
```

## API Endpoints
 
**Authentication**
 
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Create a new user account |
| `POST` | `/api/login` | Authenticate a user |
| `POST` | `/logout` | Destroy the current session |
 
**Blogs**
 
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Display paginated blog posts |
| `GET` | `/blog/:id` | Display an individual blog post |
| `GET` | `/create_blog` | Display the blog creation page |
| `POST` | `/api/create_blog` | Create a new blog post |
 
**Comments**
 
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/blogs/:id/comments` | Add a comment to a blog |
| `DELETE` | `/api/comments/:id` | Delete a comment (admin only) |

 ## Database Schema
 
Three primary tables, related as `Users 1─*Blogs` and `Blogs 1─*Comments`:
 
```text
Users                Blogs                Comments
├── id               ├── id               ├── id
├── username         ├── title            ├── blog_id
├── email            ├── content          ├── author_id
├── password_hash    ├── image_url        ├── author_name
├── created_at       ├── created_at       ├── content
├── updated_at       └── user_id          └── created_at
├── last_login
├── is_active
└── is_admin
```
 
```text
Users 1 ──── * Blogs 1 ──── * Comments
  │                            ▲
  └────────────────────────────┘
        (a comment's author is also a user)
```
 ## Getting Started
 
### Prerequisites
 
- [Node.js](https://nodejs.org/) and npm
- MySQL
### 1. Clone and install
 
```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd BlogProject
npm install
```
 
### 2. Set up the database
 
Create a MySQL database, then run the schema:
 
```text
resources/database/schema.sql
```
 
This creates the `Users`, `blogs`, and `comments` tables.
 
### 3. Configure credentials
 
**Never hardcode credentials in `data.js`.** Use environment variables instead — e.g. a `.env` file:
 
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
```
 
Then wire up the MySQL connection to read from those variables.

### 4. Run it
 
```bash
npm start
```
 
Visit **http://localhost:4131** in your browser.
 
## User Flows
 
**New user**
```text
About → Sign Up → Create Account → Dashboard → Browse / Read / Create Posts
```
 
**Existing user**
```text
Login → Dashboard → Browse Adventures / Read / Comment / Create Blog
```
 
**Administrator**
```text
Login → Dashboard → Blog Post → Comments → Delete Comment
```
 
## Security Considerations
 
This is a learning project and would need hardening before production use, including:
 
- Move DB credentials and the session secret to environment variables
- Use a production-grade session store instead of the default in-memory store
- Enable secure cookies over HTTPS
- Add input validation and sanitization
- Rate-limit authentication endpoints
- Add CSRF protection and stronger password requirements
- Improve database error handling and avoid exposing sensitive config
- Add proper production logging
## Future Improvements
 
- Image uploads for blog posts
- Like/favorite functionality
- Blog search, 🏷️ categories and tags
- User profile pages
- Edit and delete blog posts
- Improved responsive design
- Location info for hiking/camping destinations
- Ratings and reviews, 🔔 notifications
- More robust admin dashboard
- Cloud deployment
## What I Learned
 
- Building REST-style API endpoints with Express
- Server-side rendering with Pug and client-server communication via `fetch`
- Session-based authentication and password hashing with bcrypt
- Middleware, route protection, and role-based authorization
- MySQL relational design, SQL queries, and foreign-key relationships
- Pagination and asynchronous JavaScript
- Connecting a frontend application to a backend API
## License
 
This project is intended for educational and portfolio purposes.
