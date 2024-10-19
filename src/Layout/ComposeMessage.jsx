import send from "../images/send.svg";
import "./ComposeMessage.css";
import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import defaultPicture from "../images/default.svg";
import ChatContent from "./ChatContent";
import { SocketContext } from "../Contexts/SocketContext";
import { useNavigate } from "react-router";

const ComposeMessage = () => {
  const [usersFound, setUsersFound] = useState([]);
  const navContext = useContext(NavContext);
  const [searchUserHovered, setSearchUserHovered] = useState(-1);
  const [messageInput, setMessageInput] = useState("");
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const handleClick = async (e) => {
    let convoID = null;
    e.preventDefault();
    if (messageInput.length > 0 && navContext.selectedElement !== null) {
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
              userName2: navContext.selectedElement.name,
              message: messageInput,
            }),
          }
        );
        if (res.ok) {
          const conversation = await res.json();

          console.log("New conversation created");
          setMessageInput("");
          if (conversation.new) {
            convoID = conversation.convoSender._id;
            console.log("New conversation created", conversation);
            navContext.setDisplayedConversations((prev) => {
              if (prev.length === 0) {
                return [...conversation.convoSender];
              } else {
                return [...prev, conversation.convoSender];
              }
            });
            sessionStorage.setItem(
              "displayedConversations",
              navContext.displayedConversations.length === 0
                ? JSON.stringify([conversation.convoSender])
                : JSON.stringify([
                    ...navContext.displayedConversations,
                    conversation.convoSender,
                  ])
            );
            socket.emit(
              "joinConversation",
              conversation.new
                ? conversation.convoSender._id
                : conversation.existingConvo._id
            );
            socket.emit(
              "requestJoinConversation",
              conversation.convoSender.userId,
              conversation.convoSender._id,
              conversation.convoRecipient
            );
          } else {
            convoID = conversation.existingConvo._id;
          }
        }
      } catch (error) {
        console.log(error);
      }
      navigate(`/chats/${convoID}`);
      navContext.setCompose(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("Clicked");
      if (
        (navContext.searchFieldRef.current &&
          !navContext.searchFieldRef.current.contains(event.target) &&
          !event.target.closest("#userSearch") &&
          !event.target.closest(".to")) ||
        event.target.closest("#icons")
      ) {
        console.log(
          "Is the search field open? ",
          navContext.searchFieldRef.current
        );

        navContext.setShowsearchField(false);
      }
    };

    if (navContext.showsearchField) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      console.log("Cleaning up");
      document.removeEventListener("click", handleClickOutside);
    };
  }, [navContext.showsearchField]);

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
            navContext?.selectedElement ? "" : "hide"
          }`}
        >
          {navContext?.selectedElement && navContext.selectedElement.name}
        </div>
        <input
          onClick={() => navContext.setShowsearchField(true)}
          onChange={debouncedHandleChange}
          type="text"
          autoFocus
          autoComplete="off"
          id="userSearch"
          placeholder=""
        />
        {navContext.showsearchField && (
          <div ref={navContext.searchFieldRef} className="searchBox">
            {usersFound.map((user, index) => (
              <div
                onClick={(e) => {
                  navContext.setSelectedElement({
                    picture: !user.profilePicture.includes("null")
                      ? user.profilePicture
                      : defaultPicture,
                    name: user.firstname + " " + user.lastname,
                  });
                  document.getElementById("userSearch").value = "";
                  navContext.setShowsearchField(false);
                  document.getElementById("userSearch").style.display = "none";
                }}
                onMouseEnter={() => setSearchUserHovered(index)}
                onMouseLeave={() => setSearchUserHovered(-1)}
                key={index}
                className={`userSearch 
              } ${searchUserHovered === index ? "hovered" : "default"}`}
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
      <form>
        <div className="chatInput">
          <input
            onChange={(e) => setMessageInput(e.target.value)}
            type="text"
            autoComplete="off"
            id="message"
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
    </div>
  );
};

export default ComposeMessage;
