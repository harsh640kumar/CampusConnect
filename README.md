# CampusConnect – Problem Statement and Technologies Used

## 1. Problem Statement

CampusConnect is a full-stack web application designed to simplify and centralize college event and student club management. In many colleges, information about hackathons, workshops, seminars, cultural festivals, and club activities is scattered across different communication channels, making it difficult for students to discover events and register for them efficiently.

The application provides a centralized platform where students can explore upcoming events, view event details, register for activities, and discover college clubs. Coordinators can manage events and club activities, while administrators can oversee platform operations through role-based access.

The main objective of CampusConnect is to improve campus engagement, simplify event management, reduce manual coordination, and provide students with a convenient, organized experience for participating in college activities.

### Key Features
- **Event discovery:** Browse and search for college events.
- **Event registration:** Register for events and retain registration data.
- **Club directory:** Explore college clubs and their activities.
- **Role-based authentication:** Provide different access and functionality for students, coordinators, and administrators.
- **Event and club management:** Allow authorized users to create and manage events and club information.
- **Centralized platform:** Bring campus activities and student participation together in one place.

## 2. Technologies Used

### Frontend
- **React.js:** Builds the interactive user interface using reusable components.
- **Vite:** Provides the frontend development server and production build process.
- **Tailwind CSS:** Creates responsive layouts and styles the application.

### Backend
- **Node.js:** Provides the JavaScript runtime for server-side application logic.
- **Express.js:** Handles API routes, HTTP requests, authentication workflows, and communication between the frontend and database.

### Database
- **MongoDB Atlas:** Provides cloud-hosted NoSQL database storage for application data, including users, events, clubs, and registrations.

### Authentication and Configuration
- **JWT (JSON Web Tokens):** Supports token-based authentication and protected routes.
- **Environment variables:** Store configuration values and sensitive credentials separately from application source code.

### Version Control and Deployment
- **Git and GitHub:** Track code changes and host the project's source code repository.
- **Vercel:** Hosts and deploys the React frontend.
- **Render:** Hosts the Node.js and Express backend API.

## 3. Overall Architecture

The application follows a client-server architecture. The React frontend sends HTTP requests to the Express backend, which processes business logic and interacts with MongoDB Atlas to store and retrieve data. The backend returns responses to the frontend, which displays the results to users.

**Technology flow:** React + Vite + Tailwind CSS → Node.js + Express.js → MongoDB Atlas

The frontend is deployed on Vercel, the backend on Render, and the source code is maintained in GitHub.

## 4. Expected Outcome

CampusConnect provides a single, accessible platform for managing college events and clubs. It helps students discover opportunities, enables coordinators to organize activities more efficiently, and gives administrators a centralized way to oversee campus engagement.


Demo Link: https://drive.google.com/file/d/1bdS31zWYKPVlkYjTuEdTljrf1r9qVUte/view?usp=sharing
