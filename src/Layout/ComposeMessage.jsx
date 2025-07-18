import send from "../images/send.svg";
import "./ComposeMessage.css";
import { useContext, useEffect, useState } from "react";
import defaultPicture from "../images/default.svg";
import ChatContent from "./ChatContent";
import { ComposeContext } from "../Contexts/ComposeContext";
import { ConversationContext } from "../Contexts/ConversationContext";
import { NavContext } from "../Contexts/NavContext";
import { ChatCacheContext } from "../Contexts/ChatCacheContext";
import { RequestContext } from "../Contexts/RequestContext";

/**
 * ComposeMessage component allows users to search for other users, compose a message,
 * and create or join a conversation.
 */
const ComposeMessage = () => {
  const [usersFound, setUsersFound] = useState([]);
  const [searchUserHovered, setSearchUserHovered] = useState(-1);
  const [messageInput, setMessageInput] = useState("");
  const composeContext = useContext(ComposeContext);
  const convoContext = useContext(ConversationContext);
  const chatCacheContext = useContext(ChatCacheContext);
  const navContext = useContext(NavContext);
  const requestContext = useContext(RequestContext);

  /**
   * Handles the click event to create or join a conversation.
   * @param {Event} e - The click event.
   */
  const handleClick = async (e) => {
    let convoID = null;
    e.preventDefault();
    if (messageInput.length > 0 && composeContext.selectedElement !== null) {
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
              userName2: composeContext.selectedElement.name,
              message: messageInput,
            }),
          }
        );
        if (res.ok) {
          const conversation = await res.json();
          console.log("New conversation created");
          console.log(conversation);
          setMessageInput("");
          convoID = conversation.convoSender._id;

          const response = await fetch(
            `http://localhost:5000/api/conversations/getRecentMessages/${convoID}`
          );
          const recentMessages = await response.json();

          chatCacheContext.setChatCache((prevCache) => {
            const newCache = new Map(prevCache);
            let messages = newCache.get(convoID);
            if (chatCacheContext.chatCache.get(convoID)) {
              messages.unshift({
                _id: conversation.convoSender.lastMessage._id,
                content: conversation.convoSender.lastMessage.content,
                sender: sessionStorage.getItem("userId"),
                timestamp: conversation.convoSender.updatedAt,
              });
            } else {
              messages = [...recentMessages];
              requestContext.setRequests((prev) => {
                let newRequests = new Map(prev);
                newRequests.delete(convoID);
                sessionStorage.setItem(
                  "requests",
                  JSON.stringify(Array.from(newRequests.entries()))
                );
                return newRequests;
              });
            }

            newCache.set(convoID, messages);

            const cacheArray = Array.from(newCache.entries());
            sessionStorage.setItem("chatCache", JSON.stringify(cacheArray));

            return newCache;
          });

          convoContext.setDisplayedConversations((prev) => {
            const updatedConversations = new Map(prev);
            updatedConversations.set(convoID, conversation.convoSender);

            const sortedConversations = new Map(
              [...updatedConversations.entries()].sort(
                (a, b) => new Date(b[1].updatedAt) - new Date(a[1].updatedAt)
              )
            );

            sessionStorage.setItem(
              "displayedConversations",
              JSON.stringify(Array.from(sortedConversations.entries()))
            );

            convoContext.setSelectedConversation(convoID);

            convoContext.selectedConversationRef.current = convoID;

            sessionStorage.setItem("selectedConversation", convoID);

            composeContext.setCompose(false);

            return sortedConversations;
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  /**
   * Effect to handle click events outside of the search field.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("Clicked");
      if (
        (composeContext.searchFieldRef.current &&
          !composeContext.searchFieldRef.current.contains(event.target) &&
          !event.target.closest("#userSearch") &&
          !event.target.closest(".to")) ||
        event.target.closest("#icons")
      ) {
        composeContext.setShowsearchField(false);
      }
    };

    if (composeContext.showsearchField) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [composeContext.showsearchField]);

  /**
   * Debounces a function by delaying its execution.
   * @param {Function} func - The function to debounce.
   * @param {number} delay - The delay in milliseconds.
   * @returns {Function} - The debounced function.
   */
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  /**
   * Handles changes in the search input field to find users.
   * @param {Event} e - The change event.
   */
  const handleChange = async (e) => {
    if (e.target.value[0] !== " " && e.target.value.length > 0) {
      try {
        const res = await fetch(
          "http://localhost:5000/api/users/search/" + e.target.value,
          {
            method: "POST",
            body: JSON.stringify({ userId: sessionStorage.getItem("userId") }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const result = await res.json();
          setUsersFound(result.result);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      setUsersFound([]);
    }
  };

  const debouncedHandleChange = debounce(handleChange, 300);

  return (
    <div
      className={`chatConvoBox ${
        navContext.navExpanded ? "expanded" : "default"
      }`}
    >
      <div className="composeHeader">
        <div className="to">To:</div>
        <div
          className={`selectedUser ${
            composeContext?.selectedElement ? "" : "hide"
          }`}
        >
          {composeContext?.selectedElement &&
            composeContext.selectedElement.name}
        </div>
        <input
          onClick={() => composeContext.setShowsearchField(true)}
          onChange={debouncedHandleChange}
          type="text"
          autoFocus
          autoComplete="off"
          id="userSearch"
          placeholder=""
        />
        {composeContext.showsearchField && (
          <div ref={composeContext.searchFieldRef} className="searchBox">
            {usersFound.map((user, index) => (
              <div
                onClick={(e) => {
                  composeContext.setSelectedElement({
                    picture: !user.profilePicture.includes("null")
                      ? user.profilePicture
                      : defaultPicture,
                    name: user.firstname + " " + user.lastname,
                  });
                  document.getElementById("userSearch").value = "";
                  composeContext.setShowsearchField(false);
                  document.getElementById("userSearch").style.display = "none";
                }}
                onMouseEnter={() => setSearchUserHovered(index)}
                onMouseLeave={() => setSearchUserHovered(-1)}
                key={index}
                className={`userSearch 
               ${searchUserHovered === index ? "hovered" : ""}`}
              >
                <div id="pfPicture">
                  <img
                    id="searchUser"
                    className="convoPicture"
                    src={
                      !user.profilePicture.includes("null")
                        ? user.profilePicture
                        : defaultPicture
                    }
                    alt="profilePic"
                  />
                </div>
                <div className="convoInfo">
                  <div id="flName">{`${user.firstname} ${user.lastname}`}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ChatContent />
      <form
        className={composeContext.selectedElement === null ? "disabled" : ""}
      >
        <div className={"chatInput"}>
          <input
            className={
              composeContext.selectedElement === null ? "disabled" : ""
            }
            onChange={(e) => setMessageInput(e.target.value)}
            type="text"
            autoComplete="off"
            id="message"
            placeholder="Aa"
            disabled={composeContext.selectedElement === null ? true : false}
          />
          <button
            disabled={composeContext.selectedElement === null ? true : false}
            onClick={(e) => handleClick(e)}
            onSubmit={(e) => handleClick(e)}
            style={{
              marginLeft: "auto",
              marginRight: "1vw",
              cursor:
                composeContext.selectedElement === null
                  ? "not-allowed"
                  : "pointer",
              backgroundColor: "transparent",
              border: "none",
            }}
          >
            <img src={send} width="25px" height="100%" alt="send" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposeMessage;
