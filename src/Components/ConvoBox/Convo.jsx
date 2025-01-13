import { useContext, useEffect, useRef, useState } from "react";
import Category from "../NavBarButtons/Category";
import { SocketContext } from "../../Contexts/SocketContext";
import defaultPicture from "../../images/default.svg";
import "./Convo.css";
import { useNavigate } from "react-router";
import { NavContext } from "../../Contexts/NavContext";
import NavBar from "../NavBar";
import { markConversationAsRead } from "../../utils/markConversationAsRead";

/**
 * Convo component represents a conversation in the chat list.
 * Handles displaying conversation details, typing indicators, and unread status.
 * @param {Object} props - The properties object.
 * @param {number} props.index - The index of the conversation in the list.
 * @param {string} props.picture - The profile picture URL.
 * @param {Object} props.conversation - The conversation object.
 * @param {Function} props.setConvoHovered - Function to set the hovered conversation index.
 * @param {number} props.convoHovered - The currently hovered conversation index.
 * @param {string} props.unread - The unread icon URL.
 * @param {string} props.conversationId - The ID of the conversation.
 */
const Convo = ({ id, picture, setConvoHovered, convoHovered, unread }) => {
  const navContext = useContext(NavContext);

  const navigate = useNavigate();

  // Function to update the read status of the message
  const updateMessageRead = async () => {
    await markConversationAsRead(id);
    navContext.setDisplayedConversations((prev) => {
      const updatedConversations = new Map(prev);
      updatedConversations.get(id).read = true;
      sessionStorage.setItem(
        "displayedConversations",
        JSON.stringify(Array.from(updatedConversations.entries()))
      );
      return updatedConversations;
    });
  };

  return (
    <div
      key={id}
      className={`userConvo ${
        navContext.selectedConversation === id ? "clicked" : "default"
      } ${convoHovered === id ? "hovered" : "default"}`}
      onMouseEnter={() => setConvoHovered(id)}
      onMouseLeave={() => setConvoHovered(null)}
      onClick={() => {
        navContext.setSelectedConversation(id);
        navContext.selectedConversationRef.current = id;
        navigate("/chats/" + id);
        navContext.setCompose(false);
        sessionStorage.setItem("selectedConversation", id);
        if (!navContext.displayedConversations.get(id).read) {
          updateMessageRead();
        }
      }}
    >
      <div id="pfPicture">
        <img
          className="convoPicture"
          src={picture !== "" ? picture : defaultPicture}
          alt="profilePic"
        />
      </div>
      <div className="convoInfo">
        <div id="idHeader">
          <div id="flName">{`${
            navContext.displayedConversations.get(id).name
          } `}</div>
          {navContext.usersTyping.has(id) && (
            <div className="typing-indicator">
              <span className="dot">•</span>
              <span className="dot">•</span>
              <span className="dot">•</span>
            </div>
          )}
        </div>
        <div
          id="latest-message"
          className={`${
            !navContext.displayedConversations.get(id).read &&
            navContext.displayedConversations.get(id).who.length === 0
              ? "unread"
              : ""
          }`}
        >{`${navContext.displayedConversations.get(id).who} ${
          navContext.displayedConversations.get(id).lastMessage === null
            ? navContext.displayedConversations.get(id).lastMessage
            : navContext.displayedConversations.get(id).lastMessage
        }`}</div>
      </div>
      {!navContext.displayedConversations.get(id).read &&
        navContext.displayedConversations.get(id).who.length === 0 && (
          <div className="unreadIcon">
            <Category img={unread} width="100%" height="100%" />
          </div>
        )}
    </div>
  );
};

export default Convo;
