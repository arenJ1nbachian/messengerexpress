import { useContext, useEffect, useRef, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import compose from "../images/compose.svg";
import search from "../images/search.svg";
import Category from "../Components/NavBarButtons/Category";
import "./Chat.css";
import "../CSS/ScrollBar.css";
import ConvoBox from "../Components/ConvoBox/ConvoBox";
import Chatbox from "./ChatBox";
import ComposeMessage from "./ComposeMessage";
import { SocketContext } from "../Contexts/SocketContext";

const Chat = () => {
  const [hovered, setHovered] = useState(false);
  const [composeHover, setComposeHover] = useState(false);

  const navBar = useContext(NavContext);

  const { socket } = useContext(SocketContext);
  const conversationRef = useRef(
    navBar?.displayedConversations?.result
      ? navBar?.displayedConversations?.result[navBar.selectedChat - 1]
      : null
  );

  useEffect(() => {
    if (
      navBar?.displayedConversations?.result &&
      navBar?.displayedConversations?.result[navBar.selectedChat - 1] !==
        conversationRef.current &&
      conversationRef.current !== null
    ) {
      socket.emit("typing", {
        conversationId: conversationRef.current?._id,
        sender: sessionStorage.getItem("userId"),
        isTyping: false,
      });
      conversationRef.current =
        navBar?.displayedConversations?.result[navBar.selectedChat - 1];
    }
  }, [navBar.selectedChat]);

  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxHeader">
          <div className="chatBoxTitle">Chats</div>
          <div
            onClick={(e) => {
              navBar.setCompose(true);
              navBar.setSelectedChat(0);

              e.stopPropagation();
            }}
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
          <div>Try Messenger for Windows</div>
        </div>
      </div>
      <div
        className={`chatConvoBox ${
          navBar.navExpanded ? "expanded" : "default"
        }`}
      >
        {navBar.compose ? <ComposeMessage /> : <Chatbox />}
      </div>
    </div>
  );
};

export default Chat;
