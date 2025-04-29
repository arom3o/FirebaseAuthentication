'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/firebase/firebaseconfig";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage () {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailLinkLoading, setEmailLinkLoading] = useState(false);
  const [isEmailLink, setIsEmailLink] = useState(false);
  const [emailPrompt, setEmailPrompt] = useState("");
  const router = useRouter();
  const { user, loading:authIsLoading } = useAuth();

  useEffect(() => {
    if (!authIsLoading && user) {
      router.push("/");
    }
  }, [user, router, authIsLoading]);

  // Email link sign-in flow
  useEffect(() => {
    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      setIsEmailLink(true);
      setError("");
      setSuccess("");
      setEmailLinkLoading(true);
      // Additional state parameters can also be passed via URL.
      // This can be used to continue the user's intended action before triggering
      // the sign-in operation.
      // Get the email if available. This should be available if the user completes
      // the flow on the same device where they started it.
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again. For example:
        // storedEmail = window.prompt('Please provide your email for confirmation');
        setEmailLinkLoading(false);
        return;
      }
        // The client SDK will parse the code from the link for you.
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          // Once is authenticated, clear email from storage
          window.localStorage.removeItem('emailForSignIn');
          // You can access the new user by importing getAdditionalUserInfo
          // and calling it with result:
          // getAdditionalUserInfo(result)
          // You can access the user's profile via:
          // getAdditionalUserInfo(result)?.profile
          // You can check if the user is new or existing:
          // getAdditionalUserInfo(result)?.isNewUser
          // Set success message variable just for users eyes..
          setSuccess("Sign-in successful! Redirecting...");
          // then I execute the router.push
          setTimeout(() => router.push("/"), 1500);
        })
        .catch((err) => {
          setError(err.message || "Failed to sign in with email link.");
        })
        .finally(() => {
          // just for good practice, I set the loading state to false
          setEmailLinkLoading(false);
        });
    }
  }, [router, authIsLoading]);

  // Handle manual email entry for email link
  const handleEmailPromptSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setEmailLinkLoading(true);
    try {
      // incase use is opening the link on a different device
      // I'm asking for the email again
      await signInWithEmailLink(auth, emailPrompt, window.location.href);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('emailForSignIn');
      }
      setSuccess("Sign-in successful! Redirecting...");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with email link.");
    } finally {
      setEmailLinkLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      handleLogin();
    }
  };

  // If in email link mode and no stored email, prompt for email
  if (isEmailLink && !emailLinkLoading && !success && !window?.localStorage?.getItem('emailForSignIn')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <form className="w-full max-w-md bg-white p-8 rounded shadow-md" 
          onSubmit={handleEmailPromptSubmit} 
          aria-label="Email link sign-in form">
          <h1 className="text-2xl font-bold mb-6 text-center">Complete Sign-In</h1>
          {error && <div className="mb-4 text-red-600 text-sm" role="alert">{error}</div>}
          <label htmlFor="emailPrompt" className="block mb-2 font-medium">Enter your email to complete sign-in</label>
          <input
            id="emailPrompt"
            type="email"
            value={emailPrompt}
            onChange={e => setEmailPrompt(e.target.value)}
            className="w-full mb-6 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            aria-label="Email address"
            tabIndex={0}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={emailLinkLoading}
            aria-label="Complete sign-in"
            tabIndex={0}
          >
            {emailLinkLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Welcome to My App Authentication</h1>
        <h2 className="mt-6 text-center text-2xl tracking-tight text-gray-600">Sign in to your account</h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isEmailLink && emailLinkLoading && (
            <div className="mb-4 text-blue-600 text-sm text-center" role="status">Completing sign-in, please wait...</div>
          )}
          {isEmailLink && success && (
            <div className="mb-4 text-green-600 text-sm text-center" role="status">{success}</div>
          )}
          {isEmailLink && error && (
            <div className="mb-4 text-red-600 text-sm text-center" role="alert">{error}</div>
          )}
          {!isEmailLink && (
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Email address"
                    tabIndex={0}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Password"
                    tabIndex={0}
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm" role="alert">{error}</div>
              )}
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={handleLogin}
                  onKeyDown={handleKeyDown}
                  aria-label="Sign in"
                  tabIndex={0}
                >
                  Sign in
                </button>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="flex w-full justify-center rounded-md border border-indigo-600 bg-white py-2 px-4 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => router.push('/signup')}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { router.push('/signup'); } }}
                  aria-label="Sign up"
                  tabIndex={0}
                >
                  Sign up
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
