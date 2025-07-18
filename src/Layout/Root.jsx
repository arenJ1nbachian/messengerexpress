import { Outlet } from "react-router-dom";
import "./Root.css";
import NavBar from "../Components/NavBar";
import { useContext } from "react";
import { UserContext } from "../Contexts/UserContext";
import Chatbox from "./ChatBox";
import { NavContext } from "../Contexts/NavContext";
import ComposeMessage from "./ComposeMessage";
import { ComposeContext } from "../Contexts/ComposeContext";

/**
 * Root component that conditionally renders the NavBar based on user's login status
 * and provides an outlet for nested routes.
 */
const Root = () => {
  // Access the user context to determine login status
  const userContext = useContext(UserContext);
  const composeContext = useContext(ComposeContext);
  const navContext = useContext(NavContext);

  return (
    <>
      {userContext.isLoggedIn && (
        <div
          className={`navBar ${
            navContext.navExpanded ? "expanded" : "default"
          }`}
        >
          <NavBar />
        </div>
      )}

      {userContext.isLoggedIn && (
        <main
          ref={navContext.mainRef}
          className={userContext.isLoggedIn ? "main" : ""}
        >
          <Outlet />
        </main>
      )}
      {userContext.isLoggedIn &&
        (composeContext.compose ? (
          <div ref={navContext.chatContainerRef} className="composeContainer">
            <ComposeMessage />
          </div>
        ) : (
          <div ref={navContext.chatContainerRef} className="chatContainer">
            <Chatbox />
          </div>
        ))}
    </>
  );
};

export default Root;
