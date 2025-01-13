import { useContext, useEffect } from "react";
import { NavContext } from "../Contexts/NavContext";
import Chatbox from "./ChatBox";
import { Outlet, useNavigate } from "react-router";

const Archived = () => {
  const navBar = useContext(NavContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!navBar.compose && navBar.selectedConversation) {
      navigate(`/archived/${navBar.selectedConversation}`);
    } else {
      navigate("/archived/none");
    }
  }, [navBar.compose, navBar.selectedConversation, navigate]);
  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Archived Chats</div>
        </div>
      </div>
    </div>
  );
};

export default Archived;
