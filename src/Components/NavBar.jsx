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
import { useNavigate } from "react-router";

const NavBar = () => {
  const [selected, setSelected] = useState(-1);
  const [hovered, setHovered] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();

  const buttonText = ["Chats", "People", "Requests", "Archive"];

  const handleNavButtonClick = (index) => {
    setSelected(index);
    switch (index) {
      case 0:
        navigate("chats");
        break;
      case 1:
        navigate("people");
        break;
      case 2:
        navigate("requests");
        break;
      case 3:
        navigate("archived");
        break;
      default:
        break;
    }
  };

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

  const handleExpanded = () => {
    setHovered(-1);
    setExpanded(!expanded);
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
          display: "flex",
          gap: "2vh",
          flexDirection: "column",
          width: "50vw",
        }}
      >
        {Array.from([message, people, request, archive], (value, index) => (
          <div
            onMouseEnter={() => (expanded ? setHovered(index) : false)}
            onMouseLeave={() => (expanded ? setHovered(-1) : false)}
            onClick={() => handleNavButtonClick(index)}
            style={{
              backgroundColor:
                expanded && (selected === index || hovered === index)
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",

              width: expanded ? "16vw" : "3vw",
              display: "flex",
              flexDirection: "row",
              border: "2px solid transparent",
              borderRadius: "10px",
            }}
          >
            <div
              key={index}
              onMouseEnter={() => (expanded ? false : setHovered(index))}
              onMouseLeave={() => (expanded ? false : setHovered(-1))}
              onClick={() => handleNavButtonClick(index)}
              style={{
                backgroundColor:
                  !expanded && (selected === index || hovered === index)
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",

                width: "50px",
                height: "50px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid transparent",
                borderRadius: "10px",
              }}
            >
              <Category img={value} />
            </div>
            {expanded && (
              <div
                style={{
                  marginLeft: "1vw",
                  textAlign: "center",
                  alignContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  color: "White",
                  fontFamily:
                    "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                }}
              >
                {buttonText[index]}
              </div>
            )}
          </div>
        ))}
        <div
          style={{ display: "flex", flexDirection: "row", marginTop: "auto" }}
        >
          <div
            className="accButton"
            onMouseEnter={() => (expanded ? setHovered(4) : false)}
            onMouseLeave={() => (expanded ? setHovered(-1) : false)}
            onClick={() => setShowSettings(!showSettings)}
            style={{
              marginTop: "auto",
              backgroundColor:
                expanded && hovered === 4
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",

              width: expanded ? "13vw" : "3vw",
              display: "flex",
              flexDirection: "row",
              border: "2px solid transparent",
              borderRadius: "10px",
              marginBottom: "2vh",
            }}
          >
            <div
              className="accButton"
              onMouseEnter={() => (expanded ? false : setHovered(4))}
              onMouseLeave={() => (expanded ? false : setHovered(-1))}
              onClick={() => setShowSettings(!showSettings)}
              style={{
                backgroundColor:
                  !expanded && hovered === 4
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                marginTop: "auto",
                width: "50px",
                height: "50px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid transparent",
                borderRadius: "10px",
              }}
            >
              <Category img={account} />
            </div>
            {expanded && (
              <div
                style={{
                  textAlign: "center",
                  alignContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  color: "White",
                  fontFamily:
                    "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                }}
              >
                {"Aren"}
              </div>
            )}
          </div>
          {expanded && (
            <div
              onMouseEnter={() => setHovered(5)}
              onMouseLeave={() => setHovered(-1)}
              onClick={handleExpanded}
              style={{
                display: "flex",
                backgroundColor:
                  hovered === 5 ? "rgba(255, 255, 255, 0.1)" : "transparent",
                width: "3vw",
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid transparent",
                borderRadius: "10px",
                marginBottom: "2vh",
              }}
            >
              <Category img={expanded === true ? chevronLeft : chevronRight} />
            </div>
          )}
        </div>
        {showSettings && (
          <div
            style={{
              position: "absolute",
              top: expanded ? "40vh" : "31vh",
              right: expanded ? "75vw" : "auto",
            }}
            ref={settingsRef}
          >
            <AccountAndSettings />
          </div>
        )}
        {!expanded && (
          <div
            onMouseEnter={() => setHovered(5)}
            onMouseLeave={() => setHovered(-1)}
            onClick={handleExpanded}
            style={{
              backgroundColor:
                hovered === 5 ? "rgba(255, 255, 255, 0.1)" : "transparent",

              width: "50px",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "2px solid transparent",
              borderRadius: "10px",
              marginBottom: "2vh",
            }}
          >
            <Category img={expanded === true ? chevronLeft : chevronRight} />
          </div>
        )}
      </Box>
    </>
  );
};

export default NavBar;
