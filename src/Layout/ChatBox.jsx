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
import { handleRequestChoice } from "../utils/handleRequestChoice";
import { markConversationAsRead } from "../utils/markConversationAsRead";

/**
 * The Chatbox component is responsible for rendering the chat content and
 * input box of the chat application. It also handles the logic for sending
 * messages and displaying the recipient's information.
 * @returns {JSX.Element} The JSX element representing the chatbox.
 */
const Chatbox = ({ request = false }) => {
  const inputRef = useRef(null);

  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState("");

  const isTyping = useRef(false);

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

  useEffect(
    () => {
      setInputValue("");
      isTyping.current = false;
      if (sessionStorage.getItem("typing") && socket) {
        const previousTyping = JSON.parse(sessionStorage.getItem("typing"));
        socket.emit("typing", {
          isTyping: false,
          conversationId: previousTyping.conversationId,
          receiver: previousTyping.receiver,
        });
        sessionStorage.removeItem("typing");
      }
    },
    nav.selectedConversation,
    socket
  );

  useEffect(() => {
    if (sessionStorage.getItem("typing") && socket) {
      socket.emit("typing", {
        isTyping: false,
        conversationId: id,
        receiver: nav?.displayedConversations?.get(nav.selectedConversation)
          .userId,
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
   * The handleClick function is used to handle the click event of the send
   * button. It sends the message to the server and clears the input field.
   * @param {Event} e - The click event.
   */
  const handleClick = async (e) => {
    e.preventDefault();

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
              userName2: nav.displayedConversations.get(
                nav.selectedConversation
              ).name,
              message: inputValue,
            }),
          }
        );
        if (res.ok) {
          const conversation = await res.json();
          console.log("New conversation created");
          setInputValue("");

          nav.setDisplayedConversations((prev) => {
            const newConversations = new Map(prev);
            newConversations.set(
              conversation.convoSender._id,
              conversation.convoSender
            );

            const sortedNewConversations = new Map(
              [...newConversations.entries()].sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
              )
            );

            sessionStorage.setItem(
              "displayedConversations",
              JSON.stringify(Array.from(sortedNewConversations.entries()))
            );

            return sortedNewConversations;
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  /**
   * The handleChange function is used to handle the change event of the input
   * field. It is used to update the inputValue state variable and to clear the
   * typing timeout.
   * @param {Event} event - The change event.
   */
  const handleChange = (event) => {
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!isTyping.current) {
      socket.emit("typing", {
        isTyping: true,
        conversationId: id,
        receiver: nav?.displayedConversations?.get(nav.selectedConversation)
          .userId,
      });
    }

    isTyping.current = true;
    sessionStorage.setItem(
      "typing",
      JSON.stringify({
        conversationId: id,
        receiver: nav?.displayedConversations?.get(nav.selectedConversation)
          .userId,
      })
    );

    typingTimeoutRef.current = setTimeout(() => {
      isTyping.current = false;
      sessionStorage.removeItem("typing");
      socket.emit("typing", {
        isTyping: false,
        conversationId: id,
        receiver: nav?.displayedConversations?.get(nav.selectedConversation)
          .userId,
      });
    }, 3000);

    setInputValue(event.target.value);
  };

  return (
    <>
      <div
        className={`chatConvoBox ${nav.navExpanded ? "expanded" : "default"}`}
      >
        {(nav.selectedConversation || nav.selectedRequest) && !nav.compose ? (
          <>
            <div className="recipient">
              <div className="uPicture">
                <Category
                  img={
                    nav.selectedRequest
                      ? nav.requests?.get(nav.selectedRequest).profilePicture
                      : nav.displayedConversations?.get(
                          nav.selectedConversation
                        )?.profilePicture || defaultPicture
                  }
                  width="100%"
                  height="100%"
                />
              </div>
              <div className="uInfo">
                <div className="uName">
                  {request
                    ? nav?.requests?.get(nav.selectedRequest)?.name
                    : nav.displayedConversations &&
                      nav?.displayedConversations?.get(nav.selectedConversation)
                        ?.name}
                </div>
                <div className="uActive">Active 10h ago</div>
              </div>
            </div>
            <ChatContent />
            {request ? (
              <div className="requestBox">
                <div className="requestInfoBox">
                  <div className="requestTitle">
                    <strong>
                      {nav?.requests?.get(nav.selectedRequest)?.name}{" "}
                    </strong>
                    wants to send you a message.
                  </div>
                  <div className="requestQuestion">
                    Do you want to let{" "}
                    <strong>
                      {" "}
                      {nav?.requests?.get(nav.selectedRequest)?.name}{" "}
                    </strong>{" "}
                    send you messages from now on?
                  </div>
                  <div className="requestInfo">
                    They'll only know you've seen their request if you choose
                    Accept.
                  </div>
                </div>
                <div className="answerRequest">
                  <button
                    onClick={async () => {
                      handleRequestChoice("accept", nav.selectedRequest);
                      nav.setRequestCount(nav.requestCount - 1);
                      nav.setDisplayedConversations((prev) => {
                        let newConversations = new Map(prev);
                        nav.requests.get(nav.selectedRequest).read = true;
                        newConversations.set(
                          nav.selectedRequest,
                          nav.requests.get(nav.selectedRequest)
                        );

                        const sortedConversations = new Map(
                          [...newConversations.entries()].sort(
                            (a, b) =>
                              new Date(b[1].updatedAt) -
                              new Date(a[1].updatedAt)
                          )
                        );
                        sessionStorage.setItem(
                          "displayedConversations",
                          JSON.stringify(
                            Array.from(sortedConversations.entries())
                          )
                        );
                        return sortedConversations;
                      });
                      nav.setRequests((prev) => {
                        let newRequests = new Map(prev);
                        newRequests.delete(nav.selectedRequest);
                        return newRequests;
                      });
                      nav.setSelectedConversation(nav.selectedRequest);
                      nav.selectedConversationRef.current = nav.selectedRequest;
                      await markConversationAsRead(nav.selectedRequest);
                      nav.setSelectedRequest(null);
                      navigate(`/requests/${nav.selectedConversation}`);
                    }}
                    className="btnChoice"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      handleRequestChoice("reject", nav.selectedRequest);
                      nav.setRequests((prev) => {
                        let newRequests = new Map(prev);
                        newRequests.delete(nav.selectedRequest);
                        return newRequests;
                      });
                      nav.setSelectedRequest(null);
                      navigate("/requests/none");
                      nav.setRequestCount(nav.requestCount - 1);
                    }}
                    className="btnChoice"
                  >
                    Decline
                  </button>
                  <button className="btnChoice">Block</button>
                </div>
              </div>
            ) : (
              <form>
                <div className="chatInput">
                  <input
                    ref={inputRef}
                    value={inputValue}
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
