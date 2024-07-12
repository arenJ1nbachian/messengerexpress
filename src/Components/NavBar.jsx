import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/joy";
import Category from "./Category";
import message from "../images/messageIcon.svg";
import people from "../images/contactsIcon.svg";
import request from "../images/requestIcon.svg";
import archive from "../images/archiveIcon.svg";
import account from "../images/accountIcon.svg";
import AccountAndSettings from "./AccountAndSettings";
import chevronLeft from "../images/chevronL.svg";
import chevronRight from "../images/chevronR.svg";

const NavBar = () => {
  const [selected, setSelected] = useState(-1);
  const [hovered, setHovered] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const settingsRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      settingsRef.current &&
      !settingsRef.current.contains(event.target) &&
      !event.target.closest(".accButton")
    ) {
      console.log("Closing settings");
      setShowSettings(false);
    }
  };

  useEffect(() => {
    console.log(showSettings);
    if (showSettings) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      console.log("Cleaning up");
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showSettings]);

  return (
    <>
      <Box
        sx={{
          marginTop: "5vh",
          paddingLeft: "16px",
          height: "95vh",
          maxHeight: "100%",
          display: "flex",
          gap: "2vh",
          flexDirection: "column",
          width: "3vw",
        }}
      >
        {Array.from([message, people, request, archive], (value, index) => (
          <div
            key={index}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(-1)}
            onClick={() => setSelected(index)}
            style={{
              backgroundColor:
                selected === index || hovered === index
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",

              width: "50px",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "2px solid transparent",
              borderRadius: "10px",
            }}
          >
            <Category img={value} />
          </div>
        ))}
        <button
          className="accButton"
          onClick={() => setShowSettings(!showSettings)}
          type="button"
          style={{
            cursor: "pointer",
            marginTop: "auto",
            marginBottom: "2vh",
            backgroundColor: "transparent",
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid transparent",
            borderRadius: "10px",
          }}
        >
          <Category img={account} />
        </button>
        {showSettings && (
          <div
            style={{ position: "absolute", top: "33vh", right: "auto" }}
            ref={settingsRef}
          >
            <AccountAndSettings />
          </div>
        )}
        <div
          onMouseEnter={() => setHovered(4)}
          onMouseLeave={() => setHovered(-1)}
          onClick={() => setExpanded(!expanded)}
          style={{
            backgroundColor:
              hovered === 4 ? "rgba(255, 255, 255, 0.1)" : "transparent",

            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid transparent",
            borderRadius: "10px",
            marginBottom: "1vh",
          }}
        >
          <Category img={expanded === true ? chevronLeft : chevronRight} />
        </div>
      </Box>
    </>
  );
};

export default NavBar;
