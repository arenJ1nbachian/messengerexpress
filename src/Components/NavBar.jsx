import React, { useContext, useEffect, useState } from "react";
import message from "../images/messageIcon.svg";
import people from "../images/contactsIcon.svg";
import request from "../images/requestIcon.svg";
import archive from "../images/archiveIcon.svg";
import io from "socket.io-client";
import { NavContext } from "../Contexts/NavContext";
import Button from "./NavBarButtons/Button";
import AccButton from "./NavBarButtons/AccButton";
import Chevron from "./NavBarButtons/Chevron";
import "./NavBar.css";
import { SocketContext } from "../Contexts/SocketContext";

const NavBar = () => {
  const navBar = useContext(NavContext);
  const socketContext = useContext(SocketContext);

  const buttonText = ["Chats", "People", "Requests", "Archive"];
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");

    socketContext.setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const uid = sessionStorage.getItem("userId");
    const fetchProfilePicture = async (uid) => {
      console.log(uid);
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
