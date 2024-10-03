import { Outlet } from "react-router-dom";
import "./Root.css";
import NavBar from "../Components/NavBar";
import { useContext, useEffect } from "react";
import { UserContext } from "../Contexts/UserContext";
import { SocketContext } from "../Contexts/SocketContext";
import Chatbox from "./ChatBox";

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
