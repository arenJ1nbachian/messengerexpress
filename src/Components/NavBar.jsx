import React, { useContext, useEffect, useRef, useState } from "react";
import message from "../images/messageIcon.svg";
import people from "../images/contactsIcon.svg";
import request from "../images/requestIcon.svg";
import archive from "../images/archiveIcon.svg";

import { NavContext } from "../Contexts/NavContext";
import Button from "./NavBarButtons/Button";
import AccButton from "./NavBarButtons/AccButton";
import Chevron from "./NavBarButtons/Chevron";
import "./NavBar.css";
import { RequestContext } from "../Contexts/RequestContext";
import { UserContext } from "../Contexts/UserContext";
const REACT_APP_API_BASE = process.env.REACT_APP_API_BASE;

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
  const requestContext = useContext(RequestContext);
  const userContext = useContext(UserContext);
  const buttonText = ["Chats", "People", "Requests", "Archive"];

  useEffect(() => {
    const getRequests = async () => {
      try {
        const requests = await fetch(
          `${REACT_APP_API_BASE}/api/conversations/getRequestCount/` +
            sessionStorage.getItem("userId"),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        if (requests.ok) {
          const result = await requests.json();
          if (result.count > 0) {
            requestContext.setRequestCount(result.count);
            sessionStorage.setItem("requestCount", result.count);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    if (sessionStorage.getItem("requestCount") === null) {
      getRequests();
    }
  }, []);

  /**
   * Fetches the user's profile picture from the server.
   * @param {string} uid - The user's ID.
   */
  const fetchProfilePicture = async (uid) => {
    try {
      const res = await fetch(
        `${REACT_APP_API_BASE}/api/users/` + uid + "/picture",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) {
        const profilePicture = await res.json();
        sessionStorage.setItem("profilePicture", profilePicture.url);
        userContext.setProfilePicture(profilePicture.url);
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
        `${REACT_APP_API_BASE}/api/users/` + uid + "/info",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) {
        const result = await res.json();

        userContext.setName(result.userDetails.firstname);
        sessionStorage.setItem("name", result.userDetails.firstname);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const uid = sessionStorage.getItem("userId");
    if (userContext.profilePicture === null) {
      fetchProfilePicture(uid);
    }
    if (userContext.name === null) {
      fetchName(uid);
    }
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
            <AccButton
              account={userContext.profilePicture}
              loggedName={userContext.name}
            />
          </div>
          {!navBar.navExpanded && <Chevron />}
        </div>
      </div>
    </>
  );
};

export default NavBar;
