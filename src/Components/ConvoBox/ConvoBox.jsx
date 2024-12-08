import { useContext, useEffect, useState } from "react";
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
          /*  const userIds = result.result.map(
            (conversation) => conversation.userId
          );
          const profilePictures = await fetch(
            "http://localhost:5000/api/users/getProfilePictures",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userIDs: userIds }),
            }
          );

          if (profilePictures.ok) {
            navContext.setDisplayedPictures(await profilePictures.json());
          }
          console.log("conversations", result); */
          if (socket) {
            result.result.forEach((conversation) => {
              console.log("Joined", conversation._id);
              socket.emit("joinConversation", conversation._id);
            });
          } else {
            console.log("No socket");
          }
          navContext.setDisplayedConversations(result.result);
          sessionStorage.setItem(
            "displayedConversations",
            JSON.stringify(result.result)
          );
        } else {
          navContext.setDisplayedConversations([]);
          sessionStorage.setItem("displayedConversations", JSON.stringify([]));
        }
      } catch (error) {
        console.log(error);
      }
    };
    displayConvo();

    return () => {
      if (socket) {
        socket.off("connect"); // Remove listener on unmount
      }
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
                navContext={navContext}
                picture={conversation.profilePicture}
                conversation={conversation}
                setConvoHovered={setConvoHovered}
                convoHovered={convoHovered}
                unread={unread}
                conversationId={conversation._id}
              />
            );
          })}
      </div>
    </>
  );
};

export default ConvoBox;
