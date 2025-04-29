'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink, sendSignInLinkToEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseconfig";
import { useAuth } from "@/context/AuthContext";

const actionCodeSettings = {
  url: process.env.NEXT_PUBLIC_FIREBASE_EMAIL_LINK_URL!,
  handleCodeInApp: true,
};

type LoginMethod = 'link' | 'password';

export default function LoginPage () {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('link');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
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
      let storedEmail = window.localStorage.getItem('emailForSignIn');
      if (!storedEmail) {
        setEmailLinkLoading(false);
        return;
      }
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          setSuccess("Sign-in successful! Redirecting...");
          setTimeout(() => router.push("/"), 1500);
        })
        .catch((err) => {
          setError(err.message || "Failed to sign in with email link.");
        })
        .finally(() => {
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

  // Handle login form submit
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (loginMethod === 'password') {
      if (!password) {
        setError("Please enter your password.");
        return;
      }
    }
    setLoading(true);
    try {
      if (loginMethod === 'link') {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('emailForSignIn', email);
        }
        setSuccess("A sign-in link has been sent to your email address. Please check your inbox.");
        setEmail("");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || (loginMethod === 'link' ? "Failed to send sign-in link." : "Invalid email or password."));
    } finally {
      setLoading(false);
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
        <h2 className="mt-6 text-center text-2xl tracking-tight text-gray-600">Sign in</h2>
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
            <form className="space-y-6" onSubmit={handleLogin} aria-label="Login form">
              <div className="flex justify-center mb-6 gap-4" role="radiogroup" aria-label="Choose login method">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="loginMethod"
                    checked={loginMethod === 'link'}
                    onChange={() => setLoginMethod('link')}
                    aria-label="Login with email link (passwordless)"
                    tabIndex={0}
                    className="accent-blue-600"
                  />
                  <span>Email Link (passwordless)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="loginMethod"
                    checked={loginMethod === 'password'}
                    onChange={() => setLoginMethod('password')}
                    aria-label="Login with email and password"
                    tabIndex={0}
                    className="accent-blue-600"
                  />
                  <span>Email & Password</span>
                </label>
              </div>
              {error && (
                <div className="text-red-600 text-sm" role="alert">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm" role="status">{success}</div>
              )}
              <label htmlFor="email" className="block mb-2 font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full mb-6 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Email address"
                tabIndex={0}
              />
              {loginMethod === 'password' && (
                <>
                  <label htmlFor="password" className="block mb-2 font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required={loginMethod === 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full mb-6 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Password"
                    tabIndex={0}
                  />
                </>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
                aria-label={loginMethod === 'link' ? 'Send sign-in link' : 'Sign in'}
                tabIndex={0}
              >
                {loading ? (loginMethod === 'link' ? 'Sending...' : 'Signing in...') : (loginMethod === 'link' ? 'Send Sign-In Link' : 'Sign In')}
              </button>
              <div className="mt-4">
                <button
                  type="button"
                  className="flex w-full justify-center rounded-md border border-indigo-600 bg-white py-2 px-4 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => router.push('/signup')}
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
