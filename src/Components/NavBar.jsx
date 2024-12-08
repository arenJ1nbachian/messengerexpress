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
import { SocketContext } from "../Contexts/SocketContext";

/**
 * A navigation bar component that displays the current user's
 * profile picture, name, and the buttons for navigating to the
 * different sections of the app.
 *
 * The component is responsible for fetching the user's profile
 * picture and name from the server and displaying them in the
 * navigation bar. It also handles the expansion of the navigation
 * bar based on the user's actions.
 *
 * @function
 * @returns {ReactElement} The navigation bar component.
 */
const NavBar = () => {
  const navBar = useContext(NavContext);

  const buttonText = ["Chats", "People", "Requests", "Archive"];
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [name, setName] = useState(null);

  /**
   * Fetches the user's profile picture from the server.
   * @param {string} uid - The user's ID.
   */
  const fetchProfilePicture = async (uid) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/" + uid + "/picture",
        {
          method: "GET",
        }
      );
      if (res.ok) {
        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);
        setProfilePictureUrl(imageUrl);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Fetches the user's name from the server.
   * @param {string} uid - The user's ID.
   */
  const fetchName = async (uid) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/" + uid + "/info",
        {
          method: "GET",
        }
      );
      if (res.ok) {
        const result = await res.json();
        setName(
          result.userDetails.firstname + " " + result.userDetails.lastname
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const uid = sessionStorage.getItem("userId");
    fetchProfilePicture(uid);
    fetchName(uid);
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
          <AccButton account={profilePictureUrl} loggedName={name} />
        </div>
        {!navBar.navExpanded && <Chevron />}
      </div>
    </>
  );
};

export default NavBar;
