'use client';

import React,{ useEffect } from "react";  
import { auth } from "@/firebase/firebaseconfig";
import { app } from "@/firebase/firebaseconfig";
import { useRouter } from "next/navigation";
import {useAuth} from "@/context/AuthContext";
import { signOut } from "firebase/auth";



export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user){
      console.log("No user found, redirecting to login");
      router.push("/login");
    }
  }, [user, router, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading authentication...
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <h1 className="text-3xl font-bold mb-8">Welcome to My App Authentication</h1>
      <p
        className="mb-8 max-w-xl text-center text-lg text-gray-600 bg-white/70 rounded-lg px-6 py-4 shadow"
        aria-label="App description"
      >
        This app demonstrates secure user authentication and sign-up using email and password with Firebase, React, and Next.js. Explore how modern web technologies enable seamless, user-friendly authentication flows.
      </p>
      {user && (
        <>
          <div className="mb-4 text-center">
            <p className="text-lg font-semibold">Email: <span className="font-normal">{user.email || 'N/A'}</span></p>
          </div>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200"
            tabIndex={0}
            aria-label="Sign out"
            onClick={() => signOut(auth)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); signOut(auth); } }}
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  );
}
