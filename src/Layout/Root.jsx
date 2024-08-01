import { Outlet } from "react-router-dom";
import "./Root.css";
import NavBar from "../Components/NavBar";
import { useContext } from "react";
import { UserContext } from "../Contexts/UserContext";

const Root = () => {
  const userContext = useContext(UserContext);
  return (
    <>
      {userContext.isLoggedIn && <NavBar />}
      <main className="main">
        <Outlet />
      </main>
    </>
  );
};

export default Root;
