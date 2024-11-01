import { useContext, useEffect } from "react";
import { NavContext } from "../Contexts/NavContext";
import Chatbox from "./ChatBox";
import { Outlet, useNavigate } from "react-router";

const Requests = () => {
  const navBar = useContext(NavContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      navBar.displayedConversations.length !== 0 &&
      !navBar.compose &&
      navBar.selectedChat !== 0
    ) {
      navigate(
        `/requests/${
          navBar.displayedConversations[navBar.selectedChat - 1]._id
        }`
      );
    } else {
      navigate("/requests/none");
    }
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Requests</div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Requests;
