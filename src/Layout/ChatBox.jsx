import { useContext, useRef, useState } from "react";
import Category from "../Components/NavBarButtons/Category";
import defaultPicture from "../images/default.svg";
import send from "../images/send.svg";
import "./ChatBox.css";
import ChatContent from "./ChatContent";

const Chatbox = () => {
  const [inputValue, setInputValue] = useState("");
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

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
      }

      isTypingRef.current = false;
    }, 2000);
  };

  return (
    <>
      <div className="recipient">
        <div className="uPicture">
          <Category img={defaultPicture} width="100%" height="100%" />
        </div>
        <div className="uInfo">
          <div className="uName">Aren Jinbachian</div>
          <div className="uActive">Active 10h ago</div>
        </div>
      </div>
      <ChatContent />
      <div className="chatInput">
        <input
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          type="text"
          autoComplete="off"
          id="userName"
          placeholder="Aa"
        />
        <div
          style={{
            marginLeft: "auto",
            marginRight: "1vw",
            cursor: "pointer",
          }}
        >
          <Category img={send} width="100%" height="100%" />
        </div>
      </div>
    </>
  );
};
export default Chatbox;
