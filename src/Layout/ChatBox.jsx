import { useContext, useRef, useState } from "react";
import Category from "../Components/NavBarButtons/Category";
import defaultPicture from "../images/default.svg";
import send from "../images/send.svg";
import "./ChatBox.css";
import ChatContent from "./ChatContent";
import { SocketContext } from "../Contexts/SocketContext";
import { NavContext } from "../Contexts/NavContext";

const Chatbox = () => {
  const [inputValue, setInputValue] = useState("");
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const { socket } = useContext(SocketContext);
  const nav = useContext(NavContext);

  const handleClick = async (e) => {
    e.preventDefault();
    console.log(nav?.displayedConversations?.result[nav.selectedChat - 1].name);
    if (
      inputValue.length > 0 &&
      nav?.displayedConversations?.result[nav.selectedChat - 1]
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
              userName2:
                nav?.displayedConversations?.result[nav.selectedChat - 1].name,
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

    if (!isTypingRef.current && !isModifierKey) {
      console.log("Currently typing");
      socket.emit("typing", {
        conversationId:
          nav?.displayedConversations.result[nav.selectedChat - 1]?._id,
        sender: sessionStorage.getItem("userId"),
        isTyping: true,
      });
      isTypingRef.current = true;
    }
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log(isTypingRef.current);
      if (isTypingRef.current) {
        console.log("Stopped typing");
        socket.emit("typing", {
          conversationId:
            nav?.displayedConversations.result[nav.selectedChat - 1]?._id,
          sender: sessionStorage.getItem("userId"),
          isTyping: false,
        });
      }

      isTypingRef.current = false;
    }, 1000);
  };

  return (
    <>
      <div className="recipient">
        <div className="uPicture">
          <Category
            img={
              (nav.displayedConversations.result &&
                nav?.displayedConversations?.result[nav.selectedChat - 1]
                  ?.profilePicture) ||
              defaultPicture
            }
            width="100%"
            height="100%"
          />
        </div>
        <div className="uInfo">
          <div className="uName">
            {nav.displayedConversations.result &&
              nav?.displayedConversations.result[nav.selectedChat - 1]?.name}
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
  );
};
export default Chatbox;
