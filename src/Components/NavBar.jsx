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
  const { socket } = useContext(SocketContext);
  const buttonText = ["Chats", "People", "Requests", "Archive"];
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    const getRequests = async () => {
      try {
        const requests = await fetch(
          "http://localhost:5000/api/conversations/getRequests/" +
            sessionStorage.getItem("userId"),
          {
            method: "GET",
          }
        );

        if (requests.ok) {
          const result = await requests.json();
          if (result.requests.length > 0) {
            navBar.setRequests(result.requests);
            navBar.setRequestCount(result.requests.length);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    getRequests();
  });

  useEffect(() => {
    if (socket) {
      socket.on("updateRequestsNumber", (num) => {
        num === -1
          ? navBar.setRequestCount((prev) => prev - 1)
          : navBar.setRequestCount((prev) => prev + 1);
      });
    }
  }, [socket]);

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
      <div
        className={
          navBar.navExpanded ? "navigationBtn expanded" : "navigationBtn"
        }
      >
        {Array.from([message, people, request, archive], (value, index) => (
          <Button
            key={index}
            value={value}
            index={index}
            buttonText={buttonText}
          />
        ))}
        <div className="acc">
          <div className={navBar.navExpanded ? "accBtn expanded" : "accBtn"}>
            <AccButton account={profilePictureUrl} loggedName={name} />
          </div>
          {!navBar.navExpanded && <Chevron />}
        </div>
      </div>
    </>
  );
};

export default NavBar;
