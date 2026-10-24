# FixFlow — Project Overview

## Product idea

FixFlow is a backend for an electronics repair management system. Customers submit repair requests for devices such as laptops and PCs. An admin assigns a technician. The technician provides an estimate, the customer approves or rejects it, and the technician updates the repair through its lifecycle.

## Why this project

The project is deliberately more realistic than a generic Todo or Blog API, but small enough to build as a single deployable backend. It provides practical learning opportunities for REST APIs, middleware, authentication, authorization, MongoDB, validation, error handling, tests and deployment.

## Initial technology choices

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv for environment configuration
- nodemon for local development
- Postman or a similar API client for manual API checks
- Automated tests will be added as implementation progresses

## Architecture choice

Use a **feature-based modular monolith**: one backend application/deployment with clear feature boundaries. Do not introduce microservices, Redis, queues or other infrastructure without a demonstrated requirement.

## Initial scope

- Customer registration and login
- Access-token authentication and a planned refresh-session lifecycle
- Customer repair request creation and viewing
- Admin assignment of technicians
- Technician estimates and repair progress updates
- Customer estimate approval/rejection
- Ownership and role checks
- Input validation, consistent errors, tests and deployment hardening

## Out of scope for the first version

- Payments
- Real-time chat
- Automatic technician scheduling
- Microservices
- Complex notification infrastructure
- Frontend application (API will initially be tested with Postman)

## Engineering principle

Build in small, verifiable tasks. Treat every design and implementation as a hypothesis to check against requirements and tests. Do not label the application production-ready just because it starts successfully.
