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

function App() {
  const { isSignedIn } = useAuth();
  return (
    <Router>
      <Routes>
        {/* Public landing page — shown to everyone not signed in */}
        <Route
          path="/"
          element={isSignedIn ? <Navigate to="/home" /> : <PublicLanding />}
        />

        {/* Auth routes */}
        <Route
          path="/sign-in/*"
          element={isSignedIn ? <Navigate to="/home" /> : <SignInPage />}
        />
        <Route
          path="/sign-up/*"
          element={isSignedIn ? <Navigate to="/home" /> : <SignUpPage />}
        />

        {/* App home (after login) */}
        <Route
          path="/home"
          element={isSignedIn ? <Landing_page /> : <Navigate to="/" />}
        />

        {/* Protected Routes */}
        <Route path="/user_profile" element={<SignedIn><User_profile /></SignedIn>} />
        <Route path="/patakaro" element={<SignedIn><Intern_home /></SignedIn>} />
        <Route path="/patakaro/details/:id" element={<SignedIn><Company_details /></SignedIn>} />
        <Route path="/fte" element={<SignedIn><Fte_home /></SignedIn>} />
        <Route path="/intellicode" element={<SignedIn><Questions_page /></SignedIn>} />
        <Route path="/upsolve/:id" element={<SignedIn><Upsolve /></SignedIn>} />
        <Route path="/questions" element={<Questions_page />} />

        {/* Catch all */}
        <Route path="*" element={<SignedOut><Navigate to="/" /></SignedOut>} />
      </Routes>
    </Router>
  );
}

export default App;