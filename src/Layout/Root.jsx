import { Outlet } from "react-router-dom";
import "./Root.css";
import NavBar from "../Components/NavBar";
import { useContext, useEffect } from "react";
import { UserContext } from "../Contexts/UserContext";
import { SocketContext } from "../Contexts/SocketContext";

const Root = () => {
  const userContext = useContext(UserContext);
  const socketContext = useContext(SocketContext);

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
