import { useContext } from "react";
import { NavContext } from "../Contexts/NavContext";
import compose from "../images/compose.svg";
import search from "../images/search.svg";
import Category from "../Components/NavBarButtons/Category";
import "./Chat.css";

const Chat = () => {
  const navBar = useContext(NavContext);

  return (
    <div
      style={{
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
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: "auto",
            marginRight: "2vw",
            width: "60px",
            height: "60px",
            border: "2px solid rgb(76,76,76)",
            backgroundColor: "rgb(76,76,76)",
            borderRadius: "50%",
            justifyContent: "center",
          }}
        >
          <Category img={compose} />
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
            marginLeft: "1vw",
          }}
        >
          <Category img={search} />
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
    </div>
  );
};

export default Chat;
