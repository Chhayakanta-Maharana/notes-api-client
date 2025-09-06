import React, { useState, useEffect, useContext } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { AppContext } from "./libs/contextLib";
import ThemeProvider, { ThemeContext } from "./libs/ThemeContext"; // ✅ fixed import
import { Auth } from "aws-amplify";
import { onError } from "./libs/errorLib";
import { useHistory, useLocation } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Routes from "./Routes";
import "./App.css";

function AppContent() {
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const history = useHistory();
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  async function handleLogout() {
    if (window.confirm("Are you sure you want to log out?")) {
      await Auth.signOut();
      userHasAuthenticated(false);
      history.push("/");
    }
  }

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
    } catch (e) {
      if (e !== "No current user") {
        onError(e);
      }
    }
    setIsAuthenticating(false);
  }

  return (
    !isAuthenticating && (
      <div className={`App container-fluid px-0 ${theme}`}>
        {/* Navbar */}
        <Navbar collapseOnSelect expand="md" fixed="top" className="shadow-sm">
          <LinkContainer to="/">
            <Navbar.Brand className="font-weight-bold">
              📒 NoteBook
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav activeKey={location.pathname}>
              <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === "light" ? "🌙" : "☀️"}
              </button>
              {isAuthenticated ? (
                <>
                  <LinkContainer to="/emailchange">
                    <Nav.Link>Change Email</Nav.Link>
                  </LinkContainer>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <LinkContainer to="/signup">
                    <Nav.Link>Signup</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <Nav.Link>Login</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        {/* Main content */}
        <div className="main-content">
          <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
            <Routes />
          </AppContext.Provider>
        </div>

        {/* Footer */}
        <footer>
          <p>© {new Date().getFullYear()} NoteBook. All rights reserved.</p>
        </footer>
      </div>
    )
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
