#  SprintDesk

A lightweight Agile Project Management Tool for small teams (3–10 users).
It helps teams organize work using a simple hierarchy:

**Project → User Story → Task**

---

##  Setup Instructions

### Prerequisites

* Node.js (v18+)
* npm

### Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/sprintdesk.git
cd sprintdesk
npm install
npm run dev
```

App runs at: http://localhost:3000
API Docs: http://localhost:3000/api-docs

---

##  Project Overview

SprintDesk is a simplified version of tools like Jira or Trello.

It allows users to:

* Create and manage projects
* Break projects into user stories
* Track tasks and update their status

This makes it easier for small teams to manage ongoing work.

---

##  Architecture

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js + Express
* **Database:** SQLite
* **Background Job:** node-cron

### Flow

```
Frontend → API → Database
            ↓
      Background Job
```

---

##  Project Structure

```
sprintdesk/
├── src/
│   ├── routes/        # API routes
│   ├── db/            # Database setup
│   ├── jobs/          # Background tasks
│   └── index.js       # Entry point
├── public/            # Frontend files
├── swagger.yaml       # API documentation
└── README.md
```

---

##  Database Schema

### Projects

* id (Primary Key)
* name
* description
* status
* created_at

### User Stories

* id (Primary Key)
* project_id (Foreign Key)
* title
* description
* status

### Tasks

* id (Primary Key)
* story_id (Foreign Key)
* title
* description
* status
* due_date

### Relationships

* One Project → Many User Stories
* One User Story → Many Tasks

---

## 🔌 API Documentation

### Main Endpoints

* GET `/api/projects` → Get all projects
* POST `/api/projects` → Create project
* GET `/api/stories/project/:id` → Get stories
* POST `/api/tasks` → Create task
* PUT `/api/tasks/:id` → Update task

Full API documentation available at:
http://localhost:3000/api-docs

---

##  Async / Background Workflow

A background job runs every 60 seconds using **node-cron**.

### It performs:

* Counts projects, stories, and tasks
* Detects overdue tasks
* Stores a summary in the database

### Failure Handling:

* Errors are logged
* Server continues running
* No crash on failure

---

##  Design Decisions & Tradeoffs

* **SQLite** chosen for simplicity and quick setup

  * Tradeoff: Not ideal for large-scale apps

* **Express.js** used for backend APIs

  * Tradeoff: Requires manual structure (no built-in architecture)

* **node-cron** for background jobs

  * Tradeoff: Limited compared to message queues

---

##  Security Considerations

* Parameterized queries (prevents SQL injection)
* Input validation
* Basic XSS protection in frontend
* CORS enabled for development

Note: Authentication is not implemented (future improvement)

---

##  AI Usage

AI tools were used for:

* Debugging errors
* Generating boilerplate code
* Improving development speed

All code and design decisions were reviewed and understood.

---

##  Future Improvements

* User authentication (JWT login system)
* Real-time updates (WebSockets)
* Drag-and-drop task board
* Search and filters
* Unit testing (Jest)
* Docker deployment

---

##  Optional

* Demo Link: (add if available)
* Walkthrough Video: (add if available)

---

##  Conclusion

SprintDesk demonstrates a complete full-stack application with:

* Clean architecture
* Structured data hierarchy
* API design
* Background processing

It is designed to be simple, functional, and scalable for small teams.
