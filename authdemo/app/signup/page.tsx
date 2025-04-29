'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, sendSignInLinkToEmail, createUserWithEmailAndPassword } from "firebase/auth";

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be in the authorized domains list in the Firebase Console
  url: "http://localhost:3000/login",
  handleCodeInApp: true,
  // The domain must be configured in Firebase Hosting and owned by the project.
  //linkDomain: "localhost"
};

type SignupMethod = 'link' | 'password';

const SignupPage = () => {
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('link');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSignupMethodChange = (method: SignupMethod) => {
    setSignupMethod(method);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (signupMethod === 'password') {
      if (!password || !confirmPassword) {
        setError("Please enter and confirm your password.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }
    setLoading(true);
    try {
      const auth = getAuth();
      if (signupMethod === 'link') {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('emailForSignIn', email);
        }
        setSuccess("A sign-in link has been sent to your email address. Please check your inbox.");
        setEmail("");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message || (signupMethod === 'link' ? "Failed to send sign-in link." : "Failed to create account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        className="w-full max-w-md bg-white p-8 rounded shadow-md"
        onSubmit={handleSubmit}
        aria-label="Signup form"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Signup</h1>
        <div className="flex justify-center mb-6 gap-4" role="radiogroup" aria-label="Choose signup method">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="signupMethod"
              checked={signupMethod === 'link'}
              onChange={() => handleSignupMethodChange('link')}
              aria-label="Sign up with email link (passwordless)"
              tabIndex={0}
              className="accent-blue-600"
            />
            <span>Email Link (passwordless)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="signupMethod"
              checked={signupMethod === 'password'}
              onChange={() => handleSignupMethodChange('password')}
              aria-label="Sign up with email and password"
              tabIndex={0}
              className="accent-blue-600"
            />
            <span>Email & Password</span>
          </label>
        </div>
        {error && (
          <div className="mb-4 text-red-600 text-sm" role="alert">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-green-600 text-sm" role="status">{success}</div>
        )}
        <label htmlFor="email" className="block mb-2 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          className="w-full mb-6 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          aria-label="Email address"
          tabIndex={0}
        />
        {signupMethod === 'password' && (
          <>
            <label htmlFor="password" className="block mb-2 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={signupMethod === 'password'}
              aria-label="Password"
              tabIndex={0}
            />
            <label htmlFor="confirmPassword" className="block mb-2 font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full mb-6 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={signupMethod === 'password'}
              aria-label="Confirm password"
              tabIndex={0}
            />
          </>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
          aria-label={signupMethod === 'link' ? 'Send sign-in link' : 'Sign up'}
          tabIndex={0}
        >
          {loading ? (signupMethod === 'link' ? 'Sending...' : 'Signing up...') : (signupMethod === 'link' ? 'Send Sign-In Link' : 'Sign Up')}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
