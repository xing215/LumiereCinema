# Lumiere Cinema Back-End Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Setup and Installation](#setup-and-installation)
3. [Running the Back-End](#running-the-back-end)
4. [Folder Structure](#folder-structure)
5. [How to Add a New Feature](#how-to-add-a-new-feature)
   - [Step 1: Define the Route](#step-1-define-the-route)
   - [Step 2: Create Middleware (Optional)](#step-2-create-middleware-optional)
   - [Step 3: Implement the Controller](#step-3-implement-the-controller)
   - [Step 4: Define the Model](#step-4-define-the-model)
   - [Step 5: Test the Feature](#step-5-test-the-feature)

---

## Introduction

The Lumiere Cinema Back-End is a Node.js application that provides APIs for managing cinema operations, including ticket booking, branch management, movie schedules, and more. This document will guide you through setting up the back-end, running it, and adding new features.

---

## Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Redis (for caching)

### Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd LumiereCinema/Project/src/back-end
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the `src/back-end` directory with the following variables:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/lumiere_cinema
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   JWT_SECRET=your_jwt_secret
   ```

4. **Start MongoDB and Redis**
   - **If Redis is already installed on your system:**
     1. Start the Redis server by running the following command in your terminal:
        ```bash
        redis-server
        ```
     2. Verify that Redis is running by using the command:
        ```bash
        redis-cli ping
        ```
        If Redis is running, it will return `PONG`.

   - **If Redis is not installed on your system:**
     1. Download Redis from the [official Redis website](https://redis.io/download).
     2. Follow the installation instructions for your operating system:
        - **Windows:** Use the [Memurai Redis-compatible server](https://www.memurai.com/) or install Redis using [WSL (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install).
        - **Linux/Mac:** Extract the downloaded file and build Redis using the following commands:
          ```bash
          tar xzf redis-<version>.tar.gz
          cd redis-<version>
          make
          ```
     3. Start the Redis server:
        ```bash
        src/redis-server
        ```
     4. Verify that Redis is running:
        ```bash
        src/redis-cli ping
        ```
        If Redis is running, it will return `PONG`.

   - **Connecting to MongoDB Atlas:**
     1. Log in to your MongoDB Atlas account.
     2. Navigate to your cluster and click on "Connect".
     3. Choose "Connect your application" and copy the connection string.
     4. Replace `<username>` and `<password>` in the connection string with your database username and password.
     5. Update your `.env` file with the following:
        ```env
        MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority
        ```
     6. Replace `<database>` with the name of your database.
     7. Save the `.env` file and restart the application.

5. **Run the Application**
   ```bash
   npm run dev
   ```

---

## Running the Back-End

1. **Start the Server**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`.

2. **Access API Documentation**
   If Swagger or Postman documentation is available, access it at `http://localhost:3000/api-docs` (if configured).

---

## Folder Structure

```
back-end/
├── app.js                # Entry point of the application
├── config/               # Configuration files (e.g., database, Redis)
├── controllers/          # Business logic for each feature
├── middlewares/          # Middleware for request validation, authentication, etc.
├── models/               # Mongoose models for MongoDB
├── routes/               # API route definitions
├── utils/                # Utility functions (e.g., cache management)
└── README.md             # Documentation
```

---

## How to Add a New Feature

### Example: Adding a Feature to Manage "Reviews"

### Step 1: Define the Route

Create a new file `review.route.js` in the `routes/` folder:

```javascript
const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/review.controller');

// Define routes
router.post('/', createReview); // Add a new review
router.get('/:movieId', getReviews); // Get reviews for a movie

module.exports = router;
```

### Step 2: Create Middleware (Optional)

If you need to validate requests, create a middleware in `middlewares/`:

```javascript
const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  if (!comment || comment.length < 5) {
    return res.status(400).json({ error: 'Comment must be at least 5 characters long' });
  }
  next();
};

module.exports = validateReview;
```

### Step 3: Implement the Controller

Create a new file `review.controller.js` in the `controllers/` folder:

```javascript
const Review = require('../models/Review');

// Add a new review
const createReview = async (req, res) => {
  try {
    const { movieId, userId, rating, comment } = req.body;
    const review = new Review({ movieId, userId, rating, comment });
    await review.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add review' });
  }
};

// Get reviews for a movie
const getReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = { createReview, getReviews };
```

### Step 4: Define the Model

Create a new file `Review.js` in the `models/` folder:

```javascript
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', reviewSchema);
```

### Step 5: Test the Feature

Use Postman or any API testing tool to test the new endpoints:

1. **Add a Review**
   - Method: POST
   - URL: `http://localhost:3000/api/reviews`
   - Body:
     ```json
     {
       "movieId": "<movie-id>",
       "userId": "<user-id>",
       "rating": 5,
       "comment": "Amazing movie!"
     }
     ```

2. **Get Reviews for a Movie**
   - Method: GET
   - URL: `http://localhost:3000/api/reviews/<movie-id>`

---

By following these steps, you can easily add new features to the Lumiere Cinema Back-End while maintaining a clean and modular codebase.
