import { useContext, useEffect, useRef, useState } from "react";
import defaultPicture from "../../images/default.svg";
import "./ConvoBox.css";
import { NavContext } from "../../Contexts/NavContext";
import unread from "../../images/unread.svg";
import Convo from "./Convo";
import { SocketContext } from "../../Contexts/SocketContext";

/**
 * ConvoBox component.
 *
 * This component renders a scrollable box of conversations.
 * It also handles the logic of joining and leaving conversations.
 *
 * @returns {JSX.Element} The JSX element representing the ConvoBox component.
 */
const ConvoBox = () => {
  const [hovered, setHovered] = useState(-1);
  const [convoHovered, setConvoHovered] = useState(-1);
  const { socket } = useContext(SocketContext);
  const displayedConversations = useRef(null);
  const selectedChat = useRef(null);
  const navContext = useContext(NavContext);

  /**
   * This effect is used to get the conversations of the user
   * and to join the conversations using the socket.
   */
  useEffect(() => {
    const displayConvo = async () => {
      try {
        const conversations = await fetch(
          "http://localhost:5000/api/conversations/getConvos/" +
            sessionStorage.getItem("userId"),
          {
            method: "GET",
          }
        );

        if (conversations.ok) {
          const result = await conversations.json();
          if (socket) {
            result.result.forEach((conversation) => {
              console.log("Joined", conversation._id);
              socket.emit("joinConversation", conversation._id);
            });
          } else {
            console.log("No socket");
          }
          navContext.setDisplayedConversations(result.result);
        } else {
          navContext.setDisplayedConversations([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    displayConvo();
  }, [socket]);

  useEffect(() => {
    displayedConversations.current = navContext.displayedConversations;
  }, [navContext.displayedConversations]);

  useEffect(() => {
    selectedChat.current = navContext.selectedChat;
  }, [navContext.selectedChat]);

  useEffect(() => {
    if (!socket) return; // Wait until socket is initialized
    console.log("Subscribed to updateConversationHeader");
    const handleUpdate = (data) => {
      console.log("Received emit", data);
      console.log("Displayed conversations:", displayedConversations.current);
      if (sessionStorage.getItem("userId") !== data.convoReceiver.userId) {
        if (
          selectedChat.current !== 0 &&
          displayedConversations.current[selectedChat.current - 1]._id ===
            data.convoReceiver._id
        ) {
          data.convoReceiver.read = true;
        }
        const updatedConversations = [
          data.convoReceiver,
          ...displayedConversations.current.filter(
            (convo) => convo._id !== data.convoReceiver._id
          ),
        ];

        console.log("Updated conversations:", updatedConversations);
        if (selectedChat.current !== 0) {
          navContext.setSelectedChat(
            updatedConversations.findIndex(
              (conversation) =>
                conversation._id ===
                displayedConversations.current[selectedChat.current - 1]._id
            ) + 1
          );
        }

        navContext.setDisplayedConversations(updatedConversations);
      }
    };

    socket.on("updateConversationHeader", handleUpdate);

    return () => {
      console.log("Unsubscribed from updateConversationHeader");
      socket.off("updateConversationHeader", handleUpdate);
    };
  }, [socket]);

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
        }}
        className={`scrollBar convoBox ${hovered ? "hovered" : "default"}`}
      >
        <div
          id="newConvo"
          key={0}
          className={`userConvo ${navContext.compose ? "show" : "hidden"} ${
            navContext.selectedChat === 0 ? "clicked" : "default"
          } ${convoHovered === 0 ? "hovered" : "default"}`}
          onChange={() => navContext.setSelectedChat(0)}
        >
          <div id="pfPicture">
            <img
              className="convoPicture"
              src={
                navContext.selectedElement === null
                  ? defaultPicture
                  : navContext.selectedElement.picture
              }
              alt="profilePic"
            />
          </div>
          <div className="convoInfo">
            <div id="flName">{`New message ${
              navContext.selectedElement === null
                ? ""
                : "to " + navContext.selectedElement.name
            }`}</div>
          </div>
        </div>
        {navContext.displayedConversations?.length > 0 &&
          navContext.displayedConversations.map((conversation, index) => {
            return (
              <Convo
                key={conversation._id}
                index={index}
                picture={conversation.profilePicture}
                setConvoHovered={setConvoHovered}
                convoHovered={convoHovered}
                unread={unread}
              />
            );
          })}
      </div>
    </>
  );
};

export default ConvoBox;
