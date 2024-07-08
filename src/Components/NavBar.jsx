import React, { useState } from "react";
import { Box } from "@mui/joy";
import Category from "./Category";
import message from "../images/messageIcon.svg";
import people from "../images/contactsIcon.svg";
import request from "../images/requestIcon.svg";
import archive from "../images/archiveIcon.svg";
import account from "../images/accountIcon.svg";

const NavBar = () => {
  const [selected, setSelected] = useState(-1);
  const [hovered, setHovered] = useState(-1);

  return (
    <Box
      sx={{
        marginTop: "5vh",
        paddingLeft: "16px",
        height: "100vh",
        maxHeight: "100vh",
        display: "flex",
        gap: "2vh",
        flexDirection: "column",
        maxWidth: "44px",
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
        type="button"
        style={{
          cursor: "pointer",
          marginTop: "auto",
          marginBottom: "8vh",
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
    </Box>
  );
};

export default NavBar;
