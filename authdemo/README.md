# Firebase Authentication Demo with Next.js

This is a secure user authentication application built with Next.js and Firebase. It demonstrates a complete authentication system with login, signup, and protected routes.

## Features

- **User Authentication**: Sign up, login, and logout functionality
- **Protected Routes**: Secure pages that require authentication 
- **Firebase Integration**: Secure authentication using Firebase Auth
- **Modern UI**: Clean, responsive design using TailwindCSS
- **TypeScript**: Type-safe codebase
- **React Query**: Data fetching and state management

## Tech Stack

- Next.js 15+
- React 19
- Firebase 11+
- TypeScript
- TailwindCSS 4
- React Query (TanStack Query)

## Getting Started

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password provider
   - Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) with your browser to see the application**

## Project Structure

- `app/` - Next.js app directory with pages and layouts
- `context/` - React context providers including AuthContext
- `firebase/` - Firebase configuration and utilities
- `provider/` - Additional providers like ReactQueryProvider

## Deployment

The application can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ffirebase-auth-demo)

## License

This project is licensed under the MIT License.
