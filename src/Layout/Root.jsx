import { Outlet } from "react-router-dom";
import "./Root.css";
import NavBar from "../Components/NavBar";
import { useContext } from "react";
import { UserContext } from "../Contexts/UserContext";
import Chatbox from "./ChatBox";
import { NavContext } from "../Contexts/NavContext";
import ComposeMessage from "./ComposeMessage";

/**
 * Root component that conditionally renders the NavBar based on user's login status
 * and provides an outlet for nested routes.
 */
const Root = () => {
  // Access the user context to determine login status
  const userContext = useContext(UserContext);
  const navContext = useContext(NavContext);

  return (
    <>
      {/* Render NavBar if the user is logged in */}
      {userContext.isLoggedIn && <NavBar />}

      <main className="main">
        {/* Outlet for rendering child routes */}
        <Outlet />
      </main>
      {navContext.compose ? (
        <div className="composeContainer">
          <ComposeMessage />
        </div>
      ) : (
        <div className="chatContainer">
          <Chatbox />
        </div>
      )}
    </>
  );
};

export default Root;
