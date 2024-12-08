import { useContext, useEffect, useRef, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import compose from "../images/compose.svg";
import search from "../images/search.svg";
import Category from "../Components/NavBarButtons/Category";
import "./Chat.css";
import "../CSS/ScrollBar.css";
import ConvoBox from "../Components/ConvoBox/ConvoBox";
import { SocketContext } from "../Contexts/SocketContext";
import { Outlet, useNavigate } from "react-router";

/**
 * This component renders the chat page where all the user's conversations get displayed.
 */
const Chat = () => {
  const [hovered, setHovered] = useState(false);
  const [composeHover, setComposeHover] = useState(false);
  const navigate = useNavigate();

  /**
   * This context contains the state of the sidebar navigation.
   */
  const navBar = useContext(NavContext);

  /**
   * This context contains the socket to communicate with the server.
   */
  const { socket } = useContext(SocketContext);

  /**
   * This effect is called when the component mounts and when the socket or the
   * displayed conversations change.
   * It sets up a listener for the "requestJoinConversation" event from the server.
   * When the event is triggered, it joins the conversation and adds it to the displayed
   * conversations.
   */
  useEffect(() => {
    if (socket) {
      socket.on("requestJoinConversation", (data) => {
        console.log("Recipient received join request", data);
        if (data.userId === sessionStorage.getItem("userId")) {
          socket.emit("joinConversation", data.conversationId);
          navBar.setDisplayedConversations((prev) => {
            if (prev.length === 0) {
              return data.convo;
            } else {
              return [...prev, data.convo];
            }
          });
          sessionStorage.setItem(
            "displayedConversations",
            navBar.displayedConversations.length === 0
              ? JSON.stringify(data.convo)
              : JSON.stringify([...navBar.displayedConversations, data.convo])
          );
        }
      });
    } else {
      console.log("Socket not found");
    }

    return () => {
      if (socket) {
        socket.off("requestJoinConversation");
      }
    };
  }, [socket]);

  /**
   * This effect is called when the component mounts and when the displayed conversations
   * change.
   * It checks if the user has a selected chat and if the displayed conversations are not
   * empty, it navigates to the selected chat.
   */
  useEffect(() => {
    if (navBar.displayedConversations.length !== 0 && !navBar.compose) {
      if (
        parseInt(sessionStorage.getItem("selectedChat")) !== 0 &&
        sessionStorage.getItem("selectedChat") !== null
      ) {
        navigate(
          `/chats/${
            navBar.displayedConversations[
              sessionStorage.getItem("selectedChat") - 1
            ]._id
          }`
        );
      }
    }
  }, [navBar.displayedConversations]);

  /**
   * This effect is called when the component mounts and when the displayed conversations
   * change.
   * It checks if the displayed conversations are empty and if the selected chat is 1, it
   * navigates to the "none" chat.
   */
  useEffect(() => {
    if (
      navBar.displayedConversations.length === 0 &&
      navBar.selectedChat === 1
    ) {
      navigate(`/chats/none`);
    }
  }, [navBar.displayedConversations]);

  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxHeader">
          <div className="chatBoxTitle">Chats</div>
          <div
            onClick={(e) => {
              navBar.setCompose(true);
              navBar.setSelectedChat(0);
              sessionStorage.setItem("selectedChat", 0);
              navigate("/chats/compose");
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
      <Outlet />
    </div>
  );
};

export default Chat;
