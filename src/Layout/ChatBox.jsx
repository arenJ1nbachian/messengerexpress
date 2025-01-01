import { useContext, useEffect, useRef, useState } from "react";
import Category from "../Components/NavBarButtons/Category";
import defaultPicture from "../images/default.svg";
import send from "../images/send.svg";
import "./ChatBox.css";
import ChatContent from "./ChatContent";
import { SocketContext } from "../Contexts/SocketContext";
import { NavContext } from "../Contexts/NavContext";
import { useParams } from "react-router";
import noConvo from "../images/noConvoSelected.png";

/**
 * The Chatbox component is responsible for rendering the chat content and
 * input box of the chat application. It also handles the logic for sending
 * messages and displaying the recipient's information.
 * @returns {JSX.Element} The JSX element representing the chatbox.
 */
const Chatbox = ({ request = false }) => {
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");

  /**
   * The isTyping state variable is used to keep track of whether the user is
   * currently typing a message or not. It is used to emit the "typing" event to
   * the server when the user starts typing a message.
   */
  const [isTyping, setIsTyping] = useState(false);

  /**
   * The typingTimeoutRef is a reference to the timeout that is set when the
   * user starts typing a message. It is used to clear the timeout when the user
   * stops typing.
   */
  const typingTimeoutRef = useRef(null);

  /**
   * The socket object is obtained from the SocketContext and is used to emit
   * events to the server.
   */
  const { socket } = useContext(SocketContext);

  /**
   * The nav object is obtained from the NavContext and is used to access the
   * currently selected conversation and the displayed conversations.
   */
  const nav = useContext(NavContext);

  /**
   * The id parameter is obtained from the useParams hook and is used to
   * determine which conversation to render.
   */
  const { id } = useParams();

  useEffect(() => {
    if (sessionStorage.getItem("typing") && socket) {
      socket.emit("typing", {
        conversationId: id,
        sender: sessionStorage.getItem("userId"),
        isTyping: false,
      });
    }
  }, [socket]);

  useEffect(() => {
    document.addEventListener("click", () => {
      inputRef.current?.focus();
    });

    return () => {
      document.removeEventListener("click", () => {});
    };
  }, []);

  /**
   * The useEffect hook is used to clear the timeout when the user navigates away
   * from the conversation page.
   */
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
      sessionStorage.removeItem("typing");
      setInputValue("");
      setIsTyping(false);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [nav.selectedChat]);

  /**
   * The handleClick function is used to handle the click event of the send
   * button. It sends the message to the server and clears the input field.
   * @param {Event} e - The click event.
   */
  const handleClick = async (e) => {
    e.preventDefault();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTyping) {
      socket.emit("typing", {
        conversationId: id,
        sender: sessionStorage.getItem("userId"),
        isTyping: false,
        submitted: true,
      });
    }
    sessionStorage.removeItem("typing");
    setIsTyping(false);

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
    });
    if (inputValue.length > 0) {
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
                nav?.displayedConversations.length > 0
                  ? nav?.displayedConversations[nav.selectedChat - 1].name
                  : nav.selectedChatDetails.current.name,
              message: inputValue,
            }),
          }
        );
        if (res.ok) {
          const conversation = await res.json();
          console.log("New conversation created");
          setInputValue("");
          if (nav.selected === 0) {
            let displayedConversations = [];
            displayedConversations.push(conversation.convoSender);
            for (let i = 0; i < nav.displayedConversations.length; i++) {
              if (
                conversation.convoSender._id !==
                nav.displayedConversations[i]._id
              ) {
                displayedConversations.push(nav.displayedConversations[i]);
              }
            }
            nav.setDisplayedConversations(displayedConversations);
            nav.setSelectedChat(1);
            sessionStorage.setItem("selectedChat", 1);
          } else {
            nav.composedMessage.current = true;
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  /**
   * The handleKeyDown function is used to handle the keydown event of the input
   * field. It is used to detect when the user is typing a message and emits the
   * "typing" event to the server.
   * @param {Event} event - The keydown event.
   */
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
      sessionStorage.setItem("typing", {
        conversationId: id,
        sender: sessionStorage.getItem("userId"),
        isTyping: true,
      });
      socket.emit("typing", {
        conversationId: id,
        sender: sessionStorage.getItem("userId"),
        isTyping: true,
      });
      setIsTyping(true);
    }
  };

  /**
   * The handleChange function is used to handle the change event of the input
   * field. It is used to update the inputValue state variable and to clear the
   * typing timeout.
   * @param {Event} event - The change event.
   */
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
        {(nav.selectedChatDetails.current || nav.selectedRequest) &&
        !nav.compose ? (
          <>
            <div className="recipient">
              <div className="uPicture">
                <Category
                  img={
                    nav.selectedRequest
                      ? nav.selectedRequest.profilePicture
                      : (nav.displayedConversations &&
                          nav?.displayedConversations?.[nav.selectedChat - 1]
                            ?.profilePicture) ||
                        nav.selectedChatDetails?.current.profilePicture ||
                        defaultPicture
                  }
                  width="100%"
                  height="100%"
                />
              </div>
              <div className="uInfo">
                <div className="uName">
                  {request
                    ? nav.selectedRequest.name
                    : (nav.displayedConversations &&
                        nav?.displayedConversations?.[nav.selectedChat - 1]
                          ?.name) ||
                      nav.selectedChatDetails.current.name}
                </div>
                <div className="uActive">Active 10h ago</div>
              </div>
            </div>
            <ChatContent />
            {request ? (
              <div className="requestBox">
                <div>
                  <div className="requestTitle">
                    <strong> {nav.selectedRequest.name} </strong>wants to send
                    you a message.
                  </div>
                  <div className="requestQuestion">
                    Do you want to let{" "}
                    <strong> {nav.selectedRequest.name} </strong> send you
                    messages from now on?
                  </div>
                  <div className="requestInfo">
                    They'll only know you've seen their request if you choose
                    Accept.
                  </div>
                </div>
                <div className="answerRequest">
                  <button className="btnChoice">Accept</button>
                  <button className="btnChoice">Decline</button>
                  <button className="btnChoice">Block</button>
                </div>
              </div>
            ) : (
              <form>
                <div className="chatInput">
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                    type="text"
                    autoComplete="off"
                    id="messageInput"
                    placeholder="Aa"
                    autoFocus={true}
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
            )}
          </>
        ) : (
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
