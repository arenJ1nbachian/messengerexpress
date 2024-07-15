import React, { useContext } from "react";
import message from "../images/messageIcon.svg";
import people from "../images/contactsIcon.svg";
import request from "../images/requestIcon.svg";
import archive from "../images/archiveIcon.svg";
import account from "../images/accountIcon.svg";
import { NavContext } from "../Contexts/NavContext";
import Button from "./NavBarButtons/Button";
import AccButton from "./NavBarButtons/AccButton";
import Chevron from "./NavBarButtons/Chevron";
import "./NavBar.css";

const NavBar = () => {
  const navBar = useContext(NavContext);

  const buttonText = ["Chats", "People", "Requests", "Archive"];

  return (
    <>
      <div className={`navBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        {Array.from([message, people, request, archive], (value, index) => (
          <Button value={value} index={index} buttonText={buttonText} />
        ))}
        <div className="accBtn">
          <AccButton account={account} />
        </div>
        {!navBar.navExpanded && <Chevron />}
      </div>
    </>
  );
};

export default NavBar;
