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
    <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
      <div className="chatBoxHeader">
        <div className="chatBoxTitle">Chats</div>
        <div
          className={`chatBoxCompose ${
            composeHover ? "composeBtnHover" : "default"
          }`}
          onMouseEnter={() => {
            setComposeHover(true);
          }}
          onMouseLeave={() => {
            setComposeHover(false);
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
        className={`chatBoxSearch ${
          navBar.navExpanded ? "expanded" : "default"
        }`}
      >
        <div>
          <Category img={search} width="100%" height="100%" />
        </div>

        <input
          type="text"
          autoComplete="off"
          id="userName"
          placeholder="Search Messenger"
        />
      </div>
      <ConvoBox />
      <div
        className={`tryMessengerBox ${hovered ? "hovered" : "default"}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Try Messenger for Windows
      </div>
    </div>
  );
};

export default Chat;
