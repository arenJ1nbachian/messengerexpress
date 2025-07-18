import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import compose from "../images/compose.svg";
import search from "../images/search.svg";
import Category from "../Components/NavBarButtons/Category";
import "./Chat.css";
import "../CSS/ScrollBar.css";
import ConvoBox from "../Components/ConvoBox/ConvoBox";

import { useNavigate } from "react-router";
import { ConversationContext } from "../Contexts/ConversationContext";
import { ComposeContext } from "../Contexts/ComposeContext";
import { ChatCacheContext } from "../Contexts/ChatCacheContext";
import { handleConversationChange } from "../utils/handleConversationChange";
import { RequestContext } from "../Contexts/RequestContext";

/**
 * This component renders the chat page where all the user's conversations get displayed.
 */
const Chat = () => {
  const [hovered, setHovered] = useState(false);
  const [composeHover, setComposeHover] = useState(false);
  const navigate = useNavigate();
  const convoContext = useContext(ConversationContext);
  const composeContext = useContext(ComposeContext);
  const navContext = useContext(NavContext);
  const chatCacheContext = useContext(ChatCacheContext);
  const requestContext = useContext(RequestContext);

  useEffect(() => {
    handleConversationChange(
      chatCacheContext,
      convoContext,
      composeContext,
      navigate,
      requestContext
    );
  }, [convoContext.selectedConversation, composeContext.compose]);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div
        className={`chatBox ${navContext.navExpanded ? "expanded" : "default"}`}
      >
        <div className="chatBoxHeader">
          <div className="chatBoxTitle">Chats</div>
          <div
            onClick={(e) => {
              composeContext.setCompose(true);
              convoContext.setSelectedConversation(null);
              convoContext.selectedConversationRef.current = null;
              sessionStorage.removeItem("selectedConversation");
              composeContext.setShowsearchField(true);
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
              width={composeHover === true ? "55%" : "25px"}
              height={composeHover === true ? "55%" : "25px"}
            />
          </div>
        </div>
        <div
          className={`chatBoxSearch ${
            navContext.navExpanded ? "expanded" : "default"
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
