import { useContext, useEffect, useRef, useState } from "react";
import Category from "../Components/NavBarButtons/Category";
import defaultPicture from "../images/default.svg";
import send from "../images/send.svg";
import "./ChatBox.css";
import ChatContent from "./ChatContent";
import { SocketContext } from "../Contexts/SocketContext";
import { NavContext } from "../Contexts/NavContext";
import { useNavigate } from "react-router";
import noConvo from "../images/noConvoSelected.png";
import { handleRequestChoice } from "../utils/handleRequestChoice";
import { markConversationAsRead } from "../utils/markConversationAsRead";
import { ConversationContext } from "../Contexts/ConversationContext";
import { RequestContext } from "../Contexts/RequestContext";
import { ComposeContext } from "../Contexts/ComposeContext";
import { ChatCacheContext } from "../Contexts/ChatCacheContext";
const REACT_APP_API_BASE = process.env.REACT_APP_API_BASE;
/**
 * The Chatbox component is responsible for rendering the chat content and
 * input box of the chat application. It also handles the logic for sending
 * messages and displaying the recipient's information.
 * @returns {JSX.Element} The JSX element representing the chatbox.
 */
const Chatbox = () => {
  const inputRef = useRef(null);

  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState("");

  const isTyping = useRef(false);

  const chatCacheContext = useContext(ChatCacheContext);

  /**
   * The typingTimeoutRef is a reference to the timeout that is set when the
   * user starts typing a message. It is used to clear the timeout when the user
   * stops typing.
   */
  const typingTimeoutRef = useRef(null);

  const typingIntervalRef = useRef(null);

  /**
   * The socket object is obtained from the SocketContext and is used to emit
   * events to the server.
   */
  const { socket } = useContext(SocketContext);

  const convoContext = useContext(ConversationContext);
  const requestContext = useContext(RequestContext);
  const navContext = useContext(NavContext);
  const composeContext = useContext(ComposeContext);

  useEffect(() => {
    if (!convoContext.selectedConversation) return;
    isTyping.current = false;
    typingTimeoutRef.current = null;
    setInputValue("");
    clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = null;
  }, [convoContext.selectedConversation]);

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
          `${REACT_APP_API_BASE}/api/conversations/createConvo`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userID1: sessionStorage.getItem("userId"),
              userName2: convoContext.displayedConversations.get(
                convoContext.selectedConversationRef.current
              ).name,
              message: inputValue,
            }),
          }
        );
        if (res.ok) {
          const conversation = await res.json();
          console.log("New conversation created");
          setInputValue("");

          chatCacheContext.setChatCache((prevCache) => {
            const newCache = new Map(prevCache);
            const oldMsgs = prevCache.get(conversation.convoSender._id) || [];

            const newMsg = {
              _id: conversation.convoSender.lastMessage._id,
              content: conversation.convoSender.lastMessage.content,
              sender: sessionStorage.getItem("userId"),
              timestamp: conversation.convoSender.updatedAt,
            };

            const merged = [newMsg, ...oldMsgs];

            newCache.set(conversation.convoSender._id, merged);

            const cacheArray = Array.from(newCache.entries());
            sessionStorage.setItem("chatCache", JSON.stringify(cacheArray));
            return newCache;
          });

          convoContext.setDisplayedConversations((prev) => {
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

  const startTyping = () => {
    if (typingIntervalRef.current) return;

    socket.current.emit("typing", {
      isTyping: true,
      conversationId: convoContext.selectedConversation,
      receiver: convoContext.displayedConversations.get(
        convoContext.selectedConversation
      ).userId,
    });

    typingIntervalRef.current = setInterval(() => {
      socket.current.emit("typing", {
        isTyping: true,
        conversationId: convoContext.selectedConversation,
        receiver: convoContext.displayedConversations.get(
          convoContext.selectedConversation
        ).userId,
      });
    }, 1500);
  };

  const stopTyping = (staleConvoId) => {
    console.log("STALE ID", staleConvoId);
    console.log("ACTUAL ID", convoContext.selectedConversationRef.current);
    if (staleConvoId === convoContext.selectedConversationRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    console.log("FRONTEND TAKING CARE OF ISTYPING FALSE");
    console.log(socket.current);

    socket?.current?.emit("typing", {
      isTyping: false,
      conversationId: convoContext.selectedConversation,
      receiver: convoContext.displayedConversations.get(
        convoContext.selectedConversation
      ).userId,
    });
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

    startTyping();
    isTyping.current = true;

    typingTimeoutRef.current = setTimeout(() => {
      const staleConvoId = convoContext.selectedConversation;
      stopTyping(staleConvoId);
    }, 3000);

    setInputValue(event.target.value);
  };

  return (
    <>
      <div
        className={`chatConvoBox ${
          navContext.navExpanded ? "expanded" : "default"
        }`}
      >
        {(convoContext.selectedConversation ||
          requestContext.selectedRequest) &&
        !composeContext.compose ? (
          <>
            <div className="recipient">
              <div className="uPicture">
                <Category
                  img={
                    requestContext.selectedRequest
                      ? requestContext.requests?.get(
                          requestContext.selectedRequest
                        )?.profilePicture || defaultPicture
                      : convoContext.displayedConversations?.get(
                          convoContext.selectedConversation
                        )?.profilePicture || defaultPicture
                  }
                  width="100%"
                  height="100%"
                />
              </div>
              <div className="uInfo">
                <div className="uName">
                  {requestContext.selectedRequest
                    ? requestContext?.requests?.get(
                        requestContext.selectedRequest
                      )?.name
                    : convoContext.displayedConversations &&
                      convoContext?.displayedConversations?.get(
                        convoContext.selectedConversation
                      )?.name}
                </div>
                <div className="uActive">Active 10h ago</div>
              </div>
            </div>
            <ChatContent request={!!requestContext.selectedRequest} />
            {!!requestContext.selectedRequest ? (
              <div className="requestBox">
                <div className="requestInfoBox">
                  <div className="requestTitle">
                    <strong>
                      {
                        requestContext?.requests?.get(
                          requestContext.selectedRequest
                        )?.name
                      }
                    </strong>{" "}
                    wants to send you a message.
                  </div>
                  <div className="requestQuestion">
                    Do you want to let{" "}
                    <strong>
                      {
                        requestContext?.requests?.get(
                          requestContext.selectedRequest
                        )?.name
                      }
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
                      await handleRequestChoice(
                        "accept",
                        requestContext.selectedRequest
                      );

                      chatCacheContext.setChatCache((prev) => {
                        const newCache = new Map(prev);

                        newCache.set(
                          requestContext.selectedRequest,
                          requestContext.requests.get(
                            requestContext.selectedRequest
                          ).messages
                        );

                        sessionStorage.setItem(
                          "chatCache",
                          JSON.stringify(Array.from(newCache.entries()))
                        );

                        return newCache;
                      });

                      requestContext.setRequestCount((prev) => {
                        sessionStorage.setItem("requestCount", prev - 1);
                        return prev - 1;
                      });
                      convoContext.setDisplayedConversations((prev) => {
                        let newConversations = new Map(prev);
                        requestContext.requests.get(
                          requestContext.selectedRequest
                        ).read = true;
                        newConversations.set(
                          requestContext.selectedRequest,
                          requestContext.requests.get(
                            requestContext.selectedRequest
                          )
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
                      requestContext.setRequests((prev) => {
                        let newRequests = new Map(prev);
                        newRequests.delete(requestContext.selectedRequest);
                        sessionStorage.setItem(
                          "requests",
                          JSON.stringify(Array.from(newRequests.entries()))
                        );
                        return newRequests;
                      });
                      navContext.setSelected(0);
                      convoContext.setSelectedConversation(
                        requestContext.selectedRequest
                      );
                      sessionStorage.setItem(
                        "selectedConversation",
                        requestContext.selectedRequest
                      );
                      requestContext.setSelectedRequest(null);
                      sessionStorage.removeItem("selectedRequest");
                      navigate("/chats/none");
                      convoContext.selectedConversationRef.current =
                        requestContext.selectedRequestRef.current;
                      requestContext.selectedRequestRef.current = null;
                      await markConversationAsRead(
                        convoContext.selectedConversationRef.current
                      );
                    }}
                    className="btnChoice"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      handleRequestChoice(
                        "reject",
                        requestContext.selectedRequestRef.current
                      );
                      requestContext.setRequests((prev) => {
                        let newRequests = new Map(prev);
                        newRequests.delete(requestContext.selectedRequest);
                        sessionStorage.setItem(
                          "requests",
                          JSON.stringify(Array.from(newRequests.entries()))
                        );
                        return newRequests;
                      });
                      requestContext.setSelectedRequest(null);
                      navigate("/requests/none");
                      requestContext.setRequestCount((prev) => {
                        sessionStorage.setItem("requestCount", prev - 1);
                        return requestContext.requestCount - 1;
                      });
                      if (requestContext.requests.size === 1) {
                        requestContext.setSelectedRequest(null);
                        requestContext.selectedRequestRef.current = null;
                        sessionStorage.removeItem("selectedRequest");
                      }
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
                    <img src={send} width="25px" height="100%" alt="send" />
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="noConversationSelected">
            <img src={noConvo} width="250px" height="250px" alt="no convo" />
            <p>No conversation selected</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Chatbox;
