

import { useEffect } from "react";  
import { auth } from "@/firebase/firebaseconfig";
import { app } from "@/firebase/firebaseconfig";
import { useRouter } from "next/navigation";
import {useAuth} from "@/context/AuthContext";



export default function Home() {
  console.log(app); 
  console.log(auth);
  return (
    <div>
      <h1> Welcome to My App Authentication </h1>
    </div>
  );
}
