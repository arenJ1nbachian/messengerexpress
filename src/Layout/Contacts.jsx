import { useContext, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import "./Contacts.css";
import Chatbox from "./ChatBox";

const Contacts = () => {
  const navBar = useContext(NavContext);

  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">People</div>
        </div>
        <div className="activeContacts">{"Active contacts (1)"}</div>
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

export default Contacts;
