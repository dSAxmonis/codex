import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Intern_home from "./components/Intern_home";
import Fte_home from "./components/Fte_home";
import Company_details from "./components/Company_details";
import Landing_page from './components/Landing_page';
import PublicLanding from './components/PublicLanding';
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import Questions_page from "./components/Questions_page";
import Upsolve from "./components/Upsolve";
import User_profile from "./components/User_profile";
import CodeCast from "./components/CodeCast";
import useAuthSync from "./Hooks/useAuthSync";
import Discussion from "./components/Discussion";

function App() {
  const { isSignedIn } = useAuth();

  // Automatically syncs Clerk user to MongoDB on login
  useAuthSync();

  return (
    <Router>
      <Routes>
        {/* Public landing */}
        <Route path="/" element={isSignedIn ? <Navigate to="/home" /> : <PublicLanding />} />

        {/* Auth */}
        <Route path="/sign-in/*" element={isSignedIn ? <Navigate to="/home" /> : <SignInPage />} />
        <Route path="/sign-up/*" element={isSignedIn ? <Navigate to="/home" /> : <SignUpPage />} />

        {/* App */}
        <Route path="/home"        element={isSignedIn ? <Landing_page /> : <Navigate to="/" />} />
        <Route path="/user_profile" element={<SignedIn><User_profile /></SignedIn>} />
        <Route path="/patakaro"    element={<SignedIn><Intern_home /></SignedIn>} />
        <Route path="/patakaro/details/:id" element={<SignedIn><Company_details /></SignedIn>} />
        <Route path="/fte"         element={<SignedIn><Fte_home /></SignedIn>} />
        <Route path="/intellicode" element={<SignedIn><Questions_page /></SignedIn>} />
        <Route path="/upsolve/:id" element={<SignedIn><Upsolve /></SignedIn>} />
        <Route path="/codecast" element={<SignedIn><CodeCast /></SignedIn>} />
        <Route path="/discussion" element={<SignedIn><Discussion /></SignedIn>} />
        <Route path="/questions"   element={<Questions_page />} />

        {/* Catch all */}
        <Route path="*" element={<SignedOut><Navigate to="/" /></SignedOut>} />
      </Routes>
    </Router>
  );
}

export default App;