import { useContext, useEffect } from "react";
import { NavContext } from "../Contexts/NavContext";
import Chatbox from "./ChatBox";
import { Outlet, useNavigate } from "react-router";

const Archived = () => {
  const navBar = useContext(NavContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (navBar.displayedConversations.length !== 0 && !navBar.compose) {
      navigate(
        `/archived/${
          navBar.displayedConversations[navBar.selectedChat - 1]._id
        }`
      );
    }
  }, []);
  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Archived Chats</div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Archived;
