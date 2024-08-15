import { useContext, useEffect, useRef, useState } from "react";
import Category from "../NavBarButtons/Category";
import { SocketContext } from "../../Contexts/SocketContext";
import defaultPicture from "../../images/default.svg";
import "./Convo.css";

const Convo = ({
  index,
  navContext,
  picture,
  conversation,
  setConvoHovered,
  convoHovered,
  unread,
  conversationId,
}) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [who, setWho] = useState(conversation.who);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    socket.on("updateConversationHeader", (data) => {
      console.log("Received listening", data);
      if (data.conversationId === conversationId) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
        setIsTyping(false);
        setLastMessage(data.lastMessage);
        if (data.sender === sessionStorage.getItem("userId")) {
          setWho("You: ");
        } else {
          setWho("");
        }
        navContext.setDisplayedConversations((prev) => {
          return {
            ...prev,
            result: prev.result.map((conversation) => {
              if (conversation._id === data.conversationId) {
                return {
                  ...conversation,
                  lastMessage: data.lastMessage,
                  who:
                    data.sender === sessionStorage.getItem("userId")
                      ? "You: "
                      : "",
                };
              } else {
                return conversation;
              }
            }),
          };
        });
      }
    });

    socket.on("typing", (data) => {
      console.log("Received typing", data);
      if (
        data.conversationId === conversationId &&
        data.sender !== sessionStorage.getItem("userId") &&
        data.isTyping
      ) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        setIsTyping(true);
      } else {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          typingTimeoutRef.current = null;
        }, 3000);
      }
    });

    return () => {
      socket.off("updateConversationHeader");
      socket.off("typing");
    };
  }, []);

  return (
    <div
      key={conversation.userId}
      className={`userConvo ${
        navContext.selectedChat === index + 1 ? "clicked" : "default"
      } ${convoHovered === index + 1 ? "hovered" : "default"}`}
      onMouseEnter={() => setConvoHovered(index + 1)}
      onMouseLeave={() => setConvoHovered(-1)}
      onClick={() => {
        navContext.setSelectedChat(index + 1);
        navContext.setCompose(false);
        navContext.setShowsearchField(true);
        navContext.setSelectedElement(null);
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
          <div id="flName">{`${conversation.name} `}</div>
          {isTyping && (
            <div className="typing-indicator">
              <span class="dot">•</span>
              <span class="dot">•</span>
              <span class="dot">•</span>
            </div>
          )}
        </div>
        <div
          id="latest-message"
          className={`${
            conversation.read === false && who.length === 0 ? "unread" : ""
          }`}
        >{`${who} ${
          lastMessage === null ? conversation.lastMessage : lastMessage
        }`}</div>
      </div>
      {conversation.read === false && who.length === 0 && (
        <div className="unreadIcon">
          <Category img={unread} width="100%" height="100%" />
        </div>
      )}
    </div>
  );
};

export default Convo;
