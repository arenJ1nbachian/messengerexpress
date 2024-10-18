import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import "./Contacts.css";
import defaultPicture from "../images/default.svg";
import { SocketContext } from "../Contexts/SocketContext";
import { useNavigate } from "react-router";

const Contacts = () => {
  const { socket } = useContext(SocketContext);
  const navBar = useContext(NavContext);
  const [activeContacts, setActiveContacts] = useState(0);
  const [convoHovered, setConvoHovered] = useState(-1);

  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      socket.on("userOffline", (data) => {
        console.log("USER OFFLINE REMOVING CONTACT", data);
        setActiveContacts((prev) => {
          return prev.filter((contact) => contact.userId !== data);
        });
      });
      socket.on("userOnline", (data) => {
        setActiveContacts((prev) => {
          return [...prev, data];
        });
      });
    }

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
    return () => {
      if (socket) {
        socket.off("userOffline");
      }
    };
  }, [socket]);

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
                  navBar.setSelected(0);
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
    </div>
  );
};

export default Contacts;
