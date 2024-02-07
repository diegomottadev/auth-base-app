# Goal of the project

This repository contain a REST API project for creating users, user roles, and user authentication using Node.js, Express.js, and Sequelize with TypeScript.

# Installation Guide

To run the code on your computer, you'll need to install Node.js and a Node.js package manager like npm or Yarn. Then, you can follow these steps to set up your development environment:

  1 - Clone the project:

    git clone https://github.com/diegomottadev/auth-base-app.git
  
  2 - Install dependencies:
    
    npm install
    
  3 - Run the application
  
    npm run dev

  4 - Create a .env file in the root of the project with similar values:

    PORT=3000
    DB_HOST=localhost
    DB_NAME=<VALUE_DB_NAME>
    DB_USER=<VALUE_DB_USER>
    DB_PASS=<VALUE_DB_USER>
    AWS_ACCESS_KEY_ID=<VALUE_AWS_ACCESS_KEY_ID>
    AWS_SECRET_ACCESS_KEY=<VALUE_AWS_SECRET_ACCESS_KEY>
    AWS_REGION==<VALUE_AWS_REGION>

  Note: It is necessary to configure an AWS S3 (Simple Storage Service) user and create a bucket with permissions to read and write images. The AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION should be replaced with your own values.

# User Management API Documentation

You can visit this link https://documenter.getpostman.com/view/21594008/2s93z873e9 and you can test the endpoints with Postman.

These documentation provides an overview of the REST API project built with Node.js, Express.js, and Sequelize using TypeScript. The API allows you to create and manage users, user roles, permissions, and user authentication in your application. It follows the principles of Representational State Transfer (REST) to provide a simple and efficient way to interact with the resources.

# Base URL:

The base URL for all API endpoints is: http://localhost:3000

# Authentication:

To access protected endpoints, you need to include an authentication token in the request headers. Obtain the token by making a POST request to the /auth/login endpoint with valid credentials. The token must be included in the Authorization header using the Bearer scheme.

# Errors:

The API returns appropriate HTTP status codes and error responses in case of failures. Error responses include a JSON object with a message field providing additional details about the error.

# Endpoints:

  Authentication Endpoints:

    POST /auth/login: Generate an authentication token by providing valid credentials.

  User Endpoints:

    POST /users: Create a new user. Provide the required user details in the request body.
    PUT /users/:id: Update user details by ID.
    DELETE /users/:id: Delete a user by ID.
    GET /users: Get a list of all users.
    GET /users/:id: Retrieve user information by ID.

  Role Endpoints:

    POST /roles: Create a new role. Provide the required role details in the request body.
    POST /roles/:id/permissions: Add permissions to a role.
    GET /roles: Get a list of all roles.
    PUT /roles/:id: Update role details by ID.
    DELETE /roles/:id: Delete a role by ID.
    PUT /roles/:id/permissions: Update permissions of a role by ID.
    GET /roles/:id: Retrieve role information by ID.

  Permission Endpoints:

    GET /permissions: Get a list of all permissions.
    GET /permissions/:id: Find a permission by ID.

  Profile Endpoints:

    GET /profile: Get the profile information of the authenticated user.
    GET /profile/photo: Get the photo of the authenticated user's profile.
    PUT /profile/photo: Update the photo of the authenticated user's profile.
    PUT /profile: Update the profile information of the authenticated user.

# Data Format:
  
All request and response bodies are in JSON format.
