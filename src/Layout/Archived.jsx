import { useContext } from "react";
import { NavContext } from "../Contexts/NavContext";
import Chatbox from "./ChatBox";

const Archived = () => {
  const navBar = useContext(NavContext);
  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Archived Chats</div>
        </div>
      </div>
      <div
        className={`chatConvoBox ${
          navBar.navExpanded ? "expanded" : "default"
        }`}
      >
        <Chatbox />
      </div>
    </div>
  );
};

export default Archived;
