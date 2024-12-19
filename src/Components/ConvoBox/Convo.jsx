import { useContext, useEffect, useRef, useState } from "react";
import Category from "../NavBarButtons/Category";
import { SocketContext } from "../../Contexts/SocketContext";
import defaultPicture from "../../images/default.svg";
import "./Convo.css";
import { useNavigate } from "react-router";
import { NavContext } from "../../Contexts/NavContext";
import NavBar from "../NavBar";

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
const Convo = ({ index, picture, setConvoHovered, convoHovered, unread }) => {
  const navContext = useContext(NavContext);
  const [read, setRead] = useState(
    navContext.displayedConversations[index].read
  );
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  // Function to update the read status of the message
  const updateMessageRead = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/conversations/convoRead",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            convoID: navContext.displayedConversations[index]._id,
          }),
        }
      );

      setRead(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (
      navContext.selectedChat !== 0 &&
      navContext.displayedConversations[navContext.selectedChat - 1]._id ===
        navContext.displayedConversations[index]._id &&
      !read &&
      navContext.displayedConversations[index].userId ===
        sessionStorage.getItem("userId")
    ) {
      updateMessageRead();
    } else if (navContext.displayedConversations[index].read !== read) {
      setRead(navContext.displayedConversations[index].read);
    }
  }, [navContext.displayedConversations]);

  // Effect to handle socket events for conversation updates and typing indicators
  useEffect(() => {
    if (socket) {
      socket.on(
        `typing_${navContext.displayedConversations[index]._id}`,
        (data) => {
          console.log("Received typing", data, navContext.selectedChat);
          if (
            data.sender !== sessionStorage.getItem("userId") &&
            data.isTyping
          ) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
            setIsTyping(true);
          } else if (
            data.sender !== sessionStorage.getItem("userId") &&
            data.isTyping === false &&
            !data.submitted
          ) {
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              typingTimeoutRef.current = null;
            }, 3000);
          } else {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
            setIsTyping(false);
          }
        }
      );
    }

    return () => {
      if (socket) {
        socket.off(`typing_${navContext.displayedConversations[index]._id}`);
      }
    };
  }, []);

  return (
    <div
      key={navContext.displayedConversations[index].userId}
      className={`userConvo ${
        navContext.selectedChat === index + 1 ? "clicked" : "default"
      } ${convoHovered === index + 1 ? "hovered" : "default"}`}
      onMouseEnter={() => setConvoHovered(index + 1)}
      onMouseLeave={() => setConvoHovered(-1)}
      onClick={() => {
        if (navContext.selectedChat - 1 !== index) {
          navContext.conversationRef.current =
            navContext.displayedConversations[navContext.selectedChat - 1];
          navContext.setSelectedChat(index + 1);
          sessionStorage.setItem("selectedChat", index + 1);
          navContext.setCompose(false);
          navContext.setShowsearchField(true);
          navContext.setSelectedElement(null);
          if (read === false) {
            updateMessageRead();
          }
          navigate(`/chats/${navContext.displayedConversations[index]._id}`);
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
          <div id="flName">{`${navContext.displayedConversations[index].name} `}</div>
          {isTyping && (
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
            read === false &&
            navContext.displayedConversations[index].who.length === 0
              ? "unread"
              : ""
          }`}
        >{`${navContext.displayedConversations[index].who} ${
          navContext.displayedConversations[index].lastMessage === null
            ? navContext.displayedConversations[index].lastMessage
            : navContext.displayedConversations[index].lastMessage
        }`}</div>
      </div>
      {read === false &&
        navContext.displayedConversations[index].who.length === 0 && (
          <div className="unreadIcon">
            <Category img={unread} width="100%" height="100%" />
          </div>
        )}
    </div>
  );
};

export default Convo;
