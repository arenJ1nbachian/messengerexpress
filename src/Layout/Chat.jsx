import { useContext, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import compose from "../images/compose.svg";
import search from "../images/search.svg";
import Category from "../Components/NavBarButtons/Category";
import "./Chat.css";
import "../Components/NavBarButtons/AccountAndSettings.css";
import ConvoBox from "../Components/ConvoBox/ConvoBox";

const Chat = () => {
  const [hovered, setHovered] = useState(false);
  const [composeHover, setComposeHover] = useState(false);

  const navBar = useContext(NavContext);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: "1vw",
        width: !navBar.navExpanded ? "34vw" : "30vw",
        height: "94vh",
        backgroundColor: "rgb(34,34,34)",
        border: "2px solid rgb(34,34,34)",
        borderRadius: "15px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginLeft: "2vw",
          marginTop: "1vw",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            fontWeight: "800",
            fontSize: "35px",
            fontFamily:
              "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
            color: "White",
          }}
        >
          Chats
        </div>
        <div
          onMouseEnter={() => {
            setComposeHover(true);
          }}
          onMouseLeave={() => {
            setComposeHover(false);
          }}
          style={{
            cursor: composeHover === true ? "pointer" : "none",
            display: "flex",
            alignItems: "center",
            marginLeft: "auto",
            marginRight: "2vw",
            width: "60px",
            height: "60px",

            borderRadius: "50%",
            justifyContent: "center",
          }}
        >
          <Category
            img={compose}
            width={composeHover === true ? "55%" : ""}
            height={composeHover === true ? "55%" : ""}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "2vh",
          width: !navBar.navExpanded ? "28vw" : "25vw",
          height: "5vh",
          border: "2px solid rgb(58,59,60)",
          backgroundColor: "rgb(58,59,60)",
          borderRadius: "75px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            marginLeft: "1vw",
          }}
        >
          <Category img={search} width="100%" height="100%" />
        </div>

        <input
          className="input"
          style={{
            border: "none",
            backgroundColor: "transparent",
            marginLeft: "1%",
            fontSize: "20px",
            fontFamily:
              "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
            color: "rgb(167,170,174)",
          }}
          type="text"
          autoComplete="off"
          id="userName"
          placeholder="Search Messenger"
        />
      </div>
      <ConvoBox />
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "90%",
          margin: "auto",
          height: "8vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "25px",
          fontFamily:
            "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
          color: "White",
          backgroundColor: hovered ? "rgb(51,51,51)" : "transparent",
          borderRadius: "10px",
        }}
      >
        Try Messenger for Windows
      </div>
    </div>
  );
};

export default Chat;
