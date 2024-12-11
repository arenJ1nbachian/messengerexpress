import { Outlet } from "react-router-dom";
import "./Root.css";
import NavBar from "../Components/NavBar";
import { useContext } from "react";
import { UserContext } from "../Contexts/UserContext";

/**
 * Root component that conditionally renders the NavBar based on user's login status
 * and provides an outlet for nested routes.
 */
const Root = () => {
  // Access the user context to determine login status
  const userContext = useContext(UserContext);

  return (
    <>
      {/* Render NavBar if the user is logged in */}
      {userContext.isLoggedIn && <NavBar />}
      <main className="main">
        {/* Outlet for rendering child routes */}
        <Outlet />
      </main>
    </>
  );
};

export default Root;
