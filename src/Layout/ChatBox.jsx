import { useContext, useEffect, useRef, useState } from "react";
import Category from "../Components/NavBarButtons/Category";
import defaultPicture from "../images/default.svg";
import send from "../images/send.svg";
import "./ChatBox.css";
import ChatContent from "./ChatContent";
import { SocketContext } from "../Contexts/SocketContext";
import { NavContext } from "../Contexts/NavContext";
import { useNavigate, useParams } from "react-router";
import noConvo from "../images/noConvoSelected.png";

const Chatbox = () => {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { socket } = useContext(SocketContext);
  const nav = useContext(NavContext);
  const { id } = useParams();

  const [conversationSelected, setConversationSelected] = useState(
    Boolean(id && id !== "none")
  );

  useEffect(() => {
    setConversationSelected(Boolean(id && id !== "none"));
  }, [id, nav.compose, nav.selectedChat, nav.displayedConversations]);

  useEffect(() => {
    if (
      nav?.displayedConversations &&
      nav?.displayedConversations[nav.selectedChat - 1] !==
        nav.conversationRef.current &&
      isTyping
    ) {
      socket.emit("typing", {
        conversationId: nav.conversationRef.current?._id,
        sender: sessionStorage.getItem("userId"),
        isTyping: false,
      });
    }

    setInputValue("");
    setIsTyping(false);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  }, [nav.selectedChat]);

  const handleClick = async (e) => {
    e.preventDefault();

    if (
      inputValue.length > 0 &&
      nav?.displayedConversations[nav.selectedChat - 1]
    ) {
      try {
        const res = await fetch(
          "http://localhost:5000/api/conversations/createConvo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID1: sessionStorage.getItem("userId"),
              userName2: nav?.displayedConversations[nav.selectedChat - 1].name,
              message: inputValue,
            }),
          }
        );
        if (res.ok) {
          console.log("New conversation created");
          setInputValue("");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleKeyDown = (event) => {
    const nonCharacterKeys = [
      "Backspace",
      "Tab",
      "Enter",
      "Shift",
      "Control",
      "Alt",
      "Escape",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Meta",
    ];

    const isModifierKey =
      event.ctrlKey || event.altKey || event.metaKey || event.shiftKey;

    if (isModifierKey || nonCharacterKeys.includes(event.key)) {
      return;
    }

    if (!isTyping && !isModifierKey) {
      socket.emit("typing", {
        conversationId: id,
        sender: sessionStorage.getItem("userId"),
        isTyping: true,
      });
      setIsTyping(true);
    }
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        socket.emit("typing", {
          conversationId: id,
          sender: sessionStorage.getItem("userId"),
          isTyping: false,
        });
      }
      setIsTyping(false);
    }, 3000);
  };

  return (
    <>
      <div
        className={`chatConvoBox ${nav.navExpanded ? "expanded" : "default"}`}
      >
        {conversationSelected && (
          <>
            <div className="recipient">
              <div className="uPicture">
                <Category
                  img={
                    (nav.displayedConversations &&
                      nav?.displayedConversations[nav.selectedChat - 1]
                        ?.profilePicture) ||
                    defaultPicture
                  }
                  width="100%"
                  height="100%"
                />
              </div>
              <div className="uInfo">
                <div className="uName">
                  {nav.displayedConversations &&
                    nav?.displayedConversations[nav.selectedChat - 1]?.name}
                </div>
                <div className="uActive">Active 10h ago</div>
              </div>
            </div>
            <ChatContent />
            <form>
              <div className="chatInput">
                <input
                  value={inputValue}
                  onKeyDown={handleKeyDown}
                  onChange={handleChange}
                  type="text"
                  autoComplete="off"
                  id="messageInput"
                  placeholder="Aa"
                />
                <button
                  onClick={(e) => handleClick(e)}
                  onSubmit={(e) => handleClick(e)}
                  style={{
                    marginLeft: "auto",
                    marginRight: "1vw",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                >
                  <img src={send} width="100%" height="100%" alt="send" />
                </button>
              </div>
            </form>
          </>
        )}

        {!conversationSelected && (
          <div className="noConversationSelected">
            <img src={noConvo} width="20%" height="25%" alt="no convo" />
            <p>No conversation selected</p>
          </div>
        )}
      </div>
    </>
  );
};
export default Chatbox;
