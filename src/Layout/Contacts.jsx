import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import "./Contacts.css";
import defaultPicture from "../images/default.svg";
import { SocketContext } from "../Contexts/SocketContext";
import { Outlet, useNavigate } from "react-router";

/**
 * Component that displays a list of active contacts in the chat box.
 * @returns {ReactElement} The component.
 */
const Contacts = () => {
  // Get the socket and the navBar context.
  const { socket } = useContext(SocketContext);
  const navBar = useContext(NavContext);

  // State variables to keep track of the active contacts and which one is hovered.
  const [activeContacts, setActiveContacts] = useState([]);
  const [convoHovered, setConvoHovered] = useState(-1);

  // Use the navigate hook to navigate to the selected chat when it changes.
  const navigate = useNavigate();

  // Fetch the online users when the component mounts.
  useEffect(() => {
    if (socket) {
      // Set up event listeners for when users go online or offline.
      socket.on("userOffline", (data) => {
        console.log("USER OFFLINE REMOVING CONTACT", data);
        setActiveContacts((prev) => {
          return prev.filter((contact) => contact.convoId === data);
        });
      });
      socket.on("userOnline", (data) => {
        console.log("USER ONLINE ADDING CONTACT", data);
        setActiveContacts((prev) => {
          return [...prev, data];
        });
      });

      // Fetch the online users when the component mounts.
      const fetchUsersOnline = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/users/getOnline", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: sessionStorage.getItem("userId"),
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setActiveContacts(data);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchUsersOnline();
    }

    // Clean up the event listeners when the component unmounts.
    return () => {
      if (socket) {
        socket.off("userOffline");
      }
    };
  }, [socket]);

  // Navigate to the selected chat when the selected chat changes.
  useEffect(() => {
    if (
      navBar.displayedConversations.length !== 0 &&
      !navBar.compose &&
      navBar.selectedChat !== 0
    ) {
      navigate(
        `/people/${navBar.displayedConversations[navBar.selectedChat - 1]._id}`
      );
    } else {
      navigate("/people/none");
    }
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">People</div>
        </div>
        <div className="activeContacts">{`Active contacts (${activeContacts.length})`}</div>
        {activeContacts &&
          activeContacts.map((contact, index) => {
            return (
              <div
                key={contact.convoId}
                onMouseEnter={() => setConvoHovered(index)}
                onMouseLeave={() => setConvoHovered(-1)}
                onClick={() => {
                  const index = navBar.displayedConversations.findIndex(
                    (convo) => convo._id === contact.convoId
                  );
                  navBar.setCompose(false);
                  navBar.setSelected(0);
                  navBar.setSelectedChat(index + 1);
                  sessionStorage.setItem("selectedChat", index + 1);
                  navigate(`/chats/${contact.convoId}`);
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
                      contact.profilePicture !== ""
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
      <Outlet />
    </div>
  );
};

export default Contacts;
