import { useContext } from "react";
import { NavContext } from "../Contexts/NavContext";
import Chatbox from "./ChatBox";

const Requests = () => {
  const navBar = useContext(NavContext);

  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Requests</div>
        </div>
      </div>
    </div>
  );
};

export default Requests;
