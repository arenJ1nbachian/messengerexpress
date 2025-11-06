import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import "./Contacts.css";
import defaultPicture from "../images/default.svg";
import { SocketContext } from "../Contexts/SocketContext";
import { useNavigate } from "react-router";
import { markConversationAsRead } from "../utils/markConversationAsRead";
import { ActiveUsersContext } from "../Contexts/ActiveUsersContext";
import { ConversationContext } from "../Contexts/ConversationContext";
import { ComposeContext } from "../Contexts/ComposeContext";

/**
 * Component that displays a list of active contacts in the chat box.
 * @returns {ReactElement} The component.
 */
const Contacts = () => {
  // Get the socket and the navBar context.
  const { socket } = useContext(SocketContext);
  const activeUsersContext = useContext(ActiveUsersContext);
  const convoContext = useContext(ConversationContext);
  const composeContext = useContext(ComposeContext);
  const navContext = useContext(NavContext);

  // State variables to keep track of the active contacts and which one is hovered.

  const [convoHovered, setConvoHovered] = useState(-1);

  // Use the navigate hook to navigate to the selected chat when it changes.
  const navigate = useNavigate();

  // Fetch the online users when the component mounts.
  useEffect(() => {
    if (socket) {
      // Set up event listeners for when users go online or offline.

      // Fetch the online users when the component mounts.
      const fetchUsersOnline = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/users/getOnline`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userId: sessionStorage.getItem("userId"),
            }),
          });

          if (res.ok) {
            const data = await res.json();
            activeUsersContext.setActiveContacts(data);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchUsersOnline();
    }
  }, [socket]);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div
        className={`chatBox ${navContext.navExpanded ? "expanded" : "default"}`}
      >
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">People</div>
        </div>
        <div className="activeContacts">{`Active contacts (${activeUsersContext.activeContacts.length})`}</div>
        {activeUsersContext.activeContacts &&
          activeUsersContext.activeContacts.map((contact, index) => {
            return (
              <div
                key={contact.convoId}
                onMouseEnter={() => setConvoHovered(index)}
                onMouseLeave={() => setConvoHovered(-1)}
                onClick={async () => {
                  if (
                    !convoContext.displayedConversations.get(contact.convoId)
                      .read
                  ) {
                    await markConversationAsRead(contact.convoId);
                    convoContext.setDisplayedConversations((prev) => {
                      const newMap = new Map(prev);
                      newMap.get(contact.convoId).read = true;
                      sessionStorage.setItem(
                        "displayedConversations",
                        JSON.stringify(Array.from(newMap.entries()))
                      );

                      return newMap;
                    });
                  }

                  convoContext.selectedConversationRef.current =
                    contact.convoId;
                  convoContext.setSelectedConversation(contact.convoId);
                  sessionStorage.setItem(
                    "selectedConversation",
                    contact.convoId
                  );
                  navContext.setSelected(0);
                  navigate(`/chats`);
                }}
                className={`userConvo people ${
                  convoHovered === index ? "hovered" : "default"
                }`}
              >
                <div
                  id="pfPicture"
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <img
                    className="convoPicture"
                    src={
                      contact.profilePicture.substring(
                        contact.profilePicture.length - 4,
                        contact.profilePicture.length
                      ) !== "null"
                        ? contact.profilePicture
                        : defaultPicture
                    }
                    alt="profilePic"
                  />
                  <span className="status-indicator"></span>
                </div>
                <div className="convoInfo">
                  <div id="idHeader">
                    <div id="flName">{`${contact.firstname} ${contact.lastname} `}</div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Contacts;
