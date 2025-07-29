# Authentication Integration

This document describes the authentication integration between the CIMS frontend and backend.

## Environment Configuration

Create a `.env` file in the frontend directory with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Backend API Endpoints

The frontend integrates with these FastAPI endpoints:

- `POST /api/v1/auth/login` - Authenticate user with username/password
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/register` - Register new headhunter (not used in login flow)

## Authentication Flow

1. **Login**: User submits username/password
2. **Token Storage**: Access token stored in localStorage
3. **Protected Routes**: Dashboard and other protected routes check authentication
4. **Auto-Redirect**: Unauthenticated users redirected to login
5. **Logout**: Token cleared and user redirected to login

## Key Components

- `lib/api.ts` - API client and token management
- `hooks/useAuth.ts` - Authentication state management
- `components/auth/` - Login components and protected route wrapper
- `app/(auth)/login/` - Login page
- `app/dashboard/` - Protected dashboard

## Error Handling

The system handles various authentication errors:
- 401: Invalid credentials
- 404: User not found  
- 500: Server errors
- Network errors

## Token Management

- Tokens stored in localStorage
- Automatic expiry checking
- Token included in Authorization header for API calls
- Automatic cleanup on logout

## Testing

To test the authentication:

1. Start the backend server on port 8000
2. Start the frontend dev server 
3. Navigate to http://localhost:3001
4. Try logging in with valid headhunter credentials
5. Check dashboard access and logout functionality
