import React, { useContext } from "react";
import { Box } from "@mui/joy";
import message from "../images/messageIcon.svg";
import people from "../images/contactsIcon.svg";
import request from "../images/requestIcon.svg";
import archive from "../images/archiveIcon.svg";
import account from "../images/accountIcon.svg";
import { NavContext } from "../Contexts/NavContext";
import Button from "./NavBarButtons/Button";
import AccButton from "./NavBarButtons/AccButton";
import Chevron from "./NavBarButtons/Chevron";

const NavBar = () => {
  const navBar = useContext(NavContext);

  const buttonText = ["Chats", "People", "Requests", "Archive"];

  return (
    <>
      <Box
        sx={{
          marginTop: "5vh",
          paddingLeft: "16px",
          height: "95vh",
          display: "flex",
          gap: "2vh",
          flexDirection: "column",
          width: navBar.navExpanded ? "16.5vw" : "3vw",
        }}
      >
        {Array.from([message, people, request, archive], (value, index) => (
          <Button value={value} index={index} buttonText={buttonText} />
        ))}
        <div
          style={{ display: "flex", flexDirection: "row", marginTop: "auto" }}
        >
          <AccButton account={account} />
        </div>
        {!navBar.navExpanded && <Chevron />}
      </Box>
    </>
  );
};

export default NavBar;
