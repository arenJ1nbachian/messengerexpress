import React, { useContext, useEffect, useState } from "react";
import message from "../images/messageIcon.svg";
import people from "../images/contactsIcon.svg";
import request from "../images/requestIcon.svg";
import archive from "../images/archiveIcon.svg";

import { NavContext } from "../Contexts/NavContext";
import Button from "./NavBarButtons/Button";
import AccButton from "./NavBarButtons/AccButton";
import Chevron from "./NavBarButtons/Chevron";
import "./NavBar.css";

const NavBar = () => {
  const navBar = useContext(NavContext);

  const buttonText = ["Chats", "People", "Requests", "Archive"];
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const uid = sessionStorage.getItem("userId");
      console.log(uid);
      try {
        const res = await fetch("http://localhost:5000/api/users/" + uid, {
          method: "GET",
        });
        if (res.ok) {
          const blob = await res.blob();
          const imageUrl = URL.createObjectURL(blob);
          setProfilePictureUrl(imageUrl);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      <div className={`navBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        {Array.from([message, people, request, archive], (value, index) => (
          <Button
            key={index}
            value={value}
            index={index}
            buttonText={buttonText}
          />
        ))}
        <div className="accBtn">
          <AccButton account={profilePictureUrl} />
        </div>
        {!navBar.navExpanded && <Chevron />}
      </div>
    </>
  );
};

export default NavBar;
