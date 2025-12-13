# Axios Integration and Token Handling in This Frontend

## Overview
This frontend uses [Axios](https://axios-http.com/) as its HTTP client to communicate with the backend API. Axios is configured to handle authentication tokens for secure API requests, ensuring that user sessions are managed and protected.

## Axios Setup
The main Axios instance is defined in `services/api.ts`. This instance is used throughout the application to make HTTP requests to the backend.

### Example: `services/api.ts`++++++++++6++s
```ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  // You can add other default configs here
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
  // Get token from localStorage
  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  if (userToken) {
    config.headers['Authorization'] = `Bearer ${userToken}`;
  } else if (adminToken) {
    config.headers['Authorization'] = `Bearer ${adminToken}`;
  }
  return config;
});

export default api;
```

## How Axios Connects to the Backend
- All API calls use the `api` instance, which automatically includes the correct base URL and authentication headers.
- Example usage in a component:
  ```ts
  import api from 'services/api';
  // ...
  const res = await api.get('/users/me');
  ```
- The backend expects a JWT token in the `Authorization` header for protected routes.

## Token Handling
### Storage
- **User tokens** are stored in `localStorage` under the key `userToken` after login/signup.
- **Admin tokens** are stored as `adminToken` for admin routes.

### Usage
- On every request, the Axios interceptor checks for a token and attaches it to the `Authorization` header.
- If a token is missing or invalid, the backend will respond with an error (e.g., 401 Unauthorized), and the frontend will redirect the user to the login page or show an error message.

### Token Removal (Logout)
- On logout, the relevant token (`userToken` or `adminToken`) is removed from `localStorage`.
- The user is then redirected to the login page.

### Example: Logout
```ts
const logout = () => {
  localStorage.removeItem('userToken');
  // or localStorage.removeItem('adminToken');
  window.location.href = '/auth/login';
};
```

## Summary
- Axios is used for all HTTP requests to the backend.
- Tokens are stored in `localStorage` and automatically attached to requests via an interceptor.
- Secure routes require a valid token; otherwise, the user is redirected to login.
- Logout removes the token and ends the session.

This setup ensures secure and seamless communication between the frontend and backend, with proper session and token management.