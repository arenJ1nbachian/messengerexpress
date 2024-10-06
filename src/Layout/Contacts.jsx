import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import "./Contacts.css";
import Chatbox from "./ChatBox";

const Contacts = () => {
  const navBar = useContext(NavContext);
  const [activeContacts, setActiveContacts] = useState(0);

  useEffect(() => {
    const fetchUsersOnline = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/getOnline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            users: navBar.displayedConversations.result.map(
              (user) => user.userId
            ),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log(data);
          setActiveContacts(data.length);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsersOnline();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">People</div>
        </div>
        <div className="activeContacts">{`Active contacts (${activeContacts})`}</div>
      </div>
    </div>
  );
};

export default Contacts;
