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
        socket.emit("joinConversation", data.conversationId);
        navBar.setDisplayedConversations((prev) => {
          if (prev.length === 0) {
            return data.convo;
          } else {
            let convos = [];
            convos.push(data.convo);
            for (const convo of prev) {
              convos.push(convo);
            }
            return convos;
          }
        });
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

  useEffect(() => {
    // If the user is not composing a message and has not selected a conversation, navigate to the "none" chat.
    if (
      !navBar.compose &&
      navBar.selectedChat === 0 &&
      !navBar.convoOverride.current.status
    ) {
      navigate(`/chats/none`);
      // If there are displayed conversations and the selected chat is not that of the compose button and the user's previously
      // composed message was not sent outside of the chats page, navigate to the selected chat.
    } else if (
      navBar.selectedChat !== 0 &&
      navBar.displayedConversations.length > 0 &&
      !navBar.composedMessage.current &&
      !navBar.convoOverride.current.status
    ) {
      if (
        !navBar.displayedConversations[navBar.selectedChat - 1]._id ===
        navBar.selectedChatDetails?.current?._id
      ) {
        const index = navBar.displayedConversations.findIndex(
          (convo) => convo._id === navBar.selectedChatDetails.current._id
        );
        navBar.setSelectedChat(index + 1);
      }

      // Navigate to the selected chat from navBar.selectedChatDetails.
      // Special case: when the user sends a message outside the chats page, avoid changing displayedConversations
      // to prevent displaying the wrong profile picture or falling back to the default one.
      // Use navBar.composedMessage to track that a message was composed outside the chats page.
      // Note: The GetConversation HTTP request automatically sorts the latest messages,
      // so we only need to setSelectedChat to the first conversation and disable composedMessage.
    } else if (
      navBar.composedMessage.current &&
      !navBar.convoOverride.current.status
    ) {
      navBar.setSelectedChat(1);
      navBar.composedMessage.current = false;
      navigate(`/chats/${navBar.selectedChatDetails.current._id}`);
    } else if (
      navBar.convoOverride.current.status &&
      navBar.displayedConversations.length > 0
    ) {
      const index =
        navBar.displayedConversations.findIndex(
          (convo) => convo._id === navBar.convoOverride.current._id
        ) + 1;
      navigate(`/chats/${navBar.convoOverride.current._id}`);
      navBar.setSelectedChat(index);
      sessionStorage.setItem("selectedChat", index);
      navBar.convoOverride.current = { status: false, _id: "" };
    }
  }, [navBar.displayedConversations]);

  /**
   * This effect is called when the component mounts and when the displayed conversations
   * change.
   * It checks if the displayed conversations are empty and if the selected chat is 1, it
   * navigates to the "none" chat.
   */

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
