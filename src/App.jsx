import React, { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./components/Home/Home";
import Auth from "./components/Auth/Auth";
import { auth, getUserFromDatabase } from "./firebase";
import Spinner from "./components/spinner/Spinner";
import Account from "./components/account/Account";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const fetchUserDetails = async (uid) => {
    const userDetails = await getUserFromDatabase(uid);
    setIsDataLoaded(true);
    setUserDetails(userDetails);
  };

  useEffect(() => {
    const listener = auth.onAuthStateChanged((user) => {
      if (!user) {
        setIsDataLoaded(true);
        setIsAuthenticated(false);
        return
      };
      setIsAuthenticated(true);
      fetchUserDetails(user.uid);
    });
    return () => listener();
  }, []);

  return (
    <div className="app">
      {isDataLoaded ?
        <BrowserRouter>
          <Routes>
            {!isAuthenticated && (
              <>
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth signup />} />
              </>
            )}
            <Route path="/" element={<Home auth={isAuthenticated} userDetails={userDetails} />} />
            <Route path="/*" element={<Navigate to="/" />} />
            <Route path="/account" element={<Account userDetails={userDetails} auth={isAuthenticated} />} />
          </Routes>
        </BrowserRouter>
        : (
          <div className="spinner">
            <Spinner />
          </div>
        )
      }
    </div>
  );
}

export default App;
