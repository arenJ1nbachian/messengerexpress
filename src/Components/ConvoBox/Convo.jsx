import { useContext, useEffect, useRef, useState } from "react";
import Category from "../NavBarButtons/Category";
import { SocketContext } from "../../Contexts/SocketContext";
import defaultPicture from "../../images/default.svg";
import "./Convo.css";
import { useNavigate } from "react-router";
import { NavContext } from "../../Contexts/NavContext";
import NavBar from "../NavBar";

const Convo = ({
  index,

  picture,
  conversation,
  setConvoHovered,
  convoHovered,
  unread,
  conversationId,
}) => {
  const [lastMessage, setLastMessage] = useState(null);
  const selectedChat = useRef(NavContext.selectedChat);
  const navContext = useContext(NavContext);
  const [who, setWho] = useState(conversation.who);
  const [read, setRead] = useState(
    navContext.displayedConversations[index]?.read
  );
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

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
            convoID: conversationId,
          }),
        }
      );
      const data = await res.json();
      setRead(data.read);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    /*  const getRead = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/conversations/getMessageRead/${conversation._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        console.log(`SETTING READ STATUS for ${conversationId}`, data);
        setRead(data.read);
      } catch (error) {
        console.log(error);
      }
    };
    if (
      navContext.displayedConversations.result[navContext.selectedChat - 1]
        ._id === conversationId
    ) {
      updateMessageRead();
    } else {
      getRead();
    }*/

    if (socket) {
      socket.on(`updateConversationHeader_${conversationId}`, (data) => {
        console.log("Received listening", data, navContext.selectedChat, index);
        if (!data.new) {
          if (data.conversationId === conversationId) {
            if (selectedChat.current === 0) {
              const selection = navContext.displayedConversations.findIndex(
                (conversation) => conversation._id === data.conversationId
              );
              navContext.setSelectedChat(selection + 1);
              sessionStorage.setItem("selectedChat", selection + 1);
              selectedChat.current = selection + 1;
            }
            if (
              navContext.displayedConversations[selectedChat.current - 1]
                ._id === conversationId &&
              conversationId === data.conversationId &&
              !navContext.displayedConversations[selectedChat.current - 1].read
            ) {
              setRead(true);
              updateMessageRead();
            } else if (
              navContext.displayedConversations[selectedChat.current - 1]
                ._id !== navContext.displayedConversations[index]._id &&
              conversationId === data.conversationId
            ) {
              setRead(false);
            }
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
              return [
                ...prev.map((conversation) => {
                  if (conversation._id === data.conversationId) {
                    return {
                      ...conversation,
                      lastMessage: data.lastMessage,
                      who:
                        data.sender === sessionStorage.getItem("userId")
                          ? "You: "
                          : "",
                      read: false,
                    };
                  } else {
                    return conversation;
                  }
                }),
              ];
            });
            sessionStorage.setItem(
              "displayedConversations",
              JSON.stringify([
                ...navContext.displayedConversations.map((conversation) => {
                  if (conversation._id === data.conversationId) {
                    return {
                      ...conversation,
                      lastMessage: data.lastMessage,
                      who:
                        data.sender === sessionStorage.getItem("userId")
                          ? "You: "
                          : "",
                      read: false,
                    };
                  } else {
                    return conversation;
                  }
                }),
              ])
            );
          }
        } else {
          navContext.setDisplayedConversations((prev) =>
            prev.length > 0 ? [...prev, data.convo] : [data.convo]
          );
          sessionStorage.setItem(
            "displayedConversations",
            navContext.displayedConversations.length > 0
              ? JSON.stringify([
                  ...navContext.displayedConversations,
                  data.convo,
                ])
              : JSON.stringify([data.convo])
          );
        }
      });

      socket.on(`typing_${conversationId}`, (data) => {
        console.log("Received typing", data, navContext.selectedChat);
        if (
          data.conversationId === conversationId &&
          data.sender !== sessionStorage.getItem("userId") &&
          data.isTyping
        ) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;

          setIsTyping(true);
        } else if (
          data.conversationId === conversationId &&
          data.sender !== sessionStorage.getItem("userId") &&
          data.isTyping === false
        ) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            typingTimeoutRef.current = null;
          }, 3000);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off(`updateConversationHeader_${conversationId}`);
        socket.off(`typing_${conversationId}`);
      }
    };
  }, []);

  useEffect(() => {
    selectedChat.current = navContext.selectedChat;
    if (selectedChat.current === index + 1) {
      updateMessageRead();
    }
  }, [navContext.selectedChat]);

  return (
    <div
      key={conversation.userId}
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
          navigate(`/chats/${conversation._id}`);
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
          <div id="flName">{`${conversation.name} `}</div>
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
          className={`${read === false && who.length === 0 ? "unread" : ""}`}
        >{`${who} ${
          lastMessage === null ? conversation.lastMessage : lastMessage
        }`}</div>
      </div>
      {read === false && who.length === 0 && (
        <div className="unreadIcon">
          <Category img={unread} width="100%" height="100%" />
        </div>
      )}
    </div>
  );
};

export default Convo;
