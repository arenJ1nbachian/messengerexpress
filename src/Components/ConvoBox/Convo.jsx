import { useContext } from "react";
import Category from "../NavBarButtons/Category";
import defaultPicture from "../../images/default.svg";
import "./Convo.css";
import { useNavigate } from "react-router";
import { markConversationAsRead } from "../../utils/markConversationAsRead";
import { ConversationContext } from "../../Contexts/ConversationContext";
import { ChatCacheContext } from "../../Contexts/ChatCacheContext";
import { ComposeContext } from "../../Contexts/ComposeContext";
import { UserTypingContext } from "../../Contexts/UserTypingContext";

/**
 * Convo component represents a conversation in the chat list.
 * Handles displaying conversation details, typing indicators, and unread status.
 * @param {Object} props - The properties object.
 * @param {number} props.index - The index of the conversation in the list.
 * @param {string} props.picture - The profile picture URL.
 * @param {Object} props.conversation - The conversation object.
 * @param {Function} props.setConvoHovered - Function to set the hovered conversation index.
 * @param {number} props.convoHovered - The currently hovered conversation index.
 * @param {string} props.unread - The unread icon URL.
 * @param {string} props.conversationId - The ID of the conversation.
 */
const Convo = ({ id, picture, setConvoHovered, convoHovered, unread }) => {
  const convoContext = useContext(ConversationContext);
  const chatCacheContext = useContext(ChatCacheContext);
  const composeContext = useContext(ComposeContext);
  const userTypingContext = useContext(UserTypingContext);

  const navigate = useNavigate();

  // Function to update the read status of the message
  const updateMessageRead = async () => {
    await markConversationAsRead(id);
    convoContext.setDisplayedConversations((prev) => {
      const updatedConversations = new Map(prev);
      updatedConversations.get(id).read = true;
      sessionStorage.setItem(
        "displayedConversations",
        JSON.stringify(Array.from(updatedConversations.entries()))
      );
      return updatedConversations;
    });
  };

  return (
    <div
      key={id}
      className={`userConvo ${
        convoContext.selectedConversation === id ? "clicked" : "default"
      } ${convoHovered === id ? "hovered" : "default"}`}
      onMouseEnter={() => setConvoHovered(id)}
      onMouseLeave={() => setConvoHovered(null)}
      onClick={() => {
        const getRecentMessages = async () => {
          try {
            const response = await fetch(
              `http://localhost:5000/api/conversations/getRecentMessages/${id}`
            );
            const data = await response.json();

            chatCacheContext.setChatCache((prevCache) => {
              const newCache = new Map(prevCache);
              newCache.set(convoContext.selectedConversationRef.current, data);

              if (newCache.size > 10) {
                const oldestKey = newCache.keys().next().value;
                newCache.delete(oldestKey);
              }

              const cacheArray = Array.from(newCache.entries());
              sessionStorage.setItem("chatCache", JSON.stringify(cacheArray));

              return newCache;
            });
          } catch (err) {
            console.log(err);
          }
        };
        if (!chatCacheContext.chatCache.has(id)) {
          getRecentMessages();
        }

        convoContext.setSelectedConversation(id);
        convoContext.selectedConversationRef.current = id;
        navigate("/chats/" + id);
        composeContext.setCompose(false);
        sessionStorage.setItem("selectedConversation", id);
        if (!convoContext.displayedConversations.get(id).read) {
          updateMessageRead();
        }
      }}
    >
      <div id="pfPicture">
        <img
          className="convoPicture"
          src={picture !== "" ? picture : defaultPicture}
          alt="profilePic"
        />
      </div>
      <div className="convoInfo">
        <div id="idHeader">
          <div id="flName">{`${
            convoContext.displayedConversations.get(id).name
          } `}</div>
          {userTypingContext.usersTyping.has(id) && (
            <div className="typing-indicator">
              <span className="dot">•</span>
              <span className="dot">•</span>
              <span className="dot">•</span>
            </div>
          )}
        </div>
        <div
          id="latest-message"
          className={`${
            !convoContext.displayedConversations.get(id).read &&
            convoContext.displayedConversations.get(id).who.length === 0
              ? "unread"
              : ""
          }`}
        >{`${convoContext.displayedConversations.get(id).who} ${
          convoContext.displayedConversations.get(id).lastMessage.content
        }`}</div>
      </div>
      {!convoContext.displayedConversations.get(id).read &&
        convoContext.displayedConversations.get(id).who.length === 0 && (
          <div className="unreadIcon">
            <Category img={unread} width="100%" height="100%" />
          </div>
        )}
    </div>
  );
};

export default Convo;
