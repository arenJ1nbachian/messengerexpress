import { useContext, useEffect, useRef, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import compose from "../images/compose.svg";
import search from "../images/search.svg";
import Category from "../Components/NavBarButtons/Category";
import "./Chat.css";
import "../CSS/ScrollBar.css";
import ConvoBox from "../Components/ConvoBox/ConvoBox";
import { SocketContext } from "../Contexts/SocketContext";
import { useNavigate } from "react-router";

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

  useEffect(() => {
    if (navBar.selectedConversation === null && !navBar.compose) {
      navigate("/chats/none");
    } else if (navBar.compose) {
      navigate("/chats/compose");
    } else {
      navigate(`/chats/${navBar.selectedConversation}`);
    }
  }, [
    navBar.compose,
    navBar.displayedConversations,
    navBar.selectedConversation,
    navigate,
  ]);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxHeader">
          <div className="chatBoxTitle">Chats</div>
          <div
            onClick={(e) => {
              navBar.setCompose(true);
              navBar.setSelectedConversation(null);
              sessionStorage.removeItem("selectedConversation");
              navBar.setShowsearchField(true);
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
    </div>
  );
};

export default Chat;
