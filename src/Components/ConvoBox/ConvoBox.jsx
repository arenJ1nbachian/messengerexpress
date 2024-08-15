import { useContext, useEffect, useState } from "react";
import defaultPicture from "../../images/default.svg";
import "./ConvoBox.css";
import { NavContext } from "../../Contexts/NavContext";
import unread from "../../images/unread.svg";
import Convo from "./Convo";
import { SocketContext } from "../../Contexts/SocketContext";

const ConvoBox = () => {
  const [hovered, setHovered] = useState(-1);
  const [convoHovered, setConvoHovered] = useState(-1);
  const { socket } = useContext(SocketContext);

  const navContext = useContext(NavContext);

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
          console.log("conversations", result);*/
          if (socket) {
            result.result.forEach((conversation) => {
              console.log("Joined", conversation._id);
              socket.emit("joinConversation", conversation._id);
            });
          } else {
            console.log("No socket");
          }
          navContext.setDisplayedConversations(result);
        } else {
          navContext.setDisplayedConversations([]);
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
        {navContext.displayedConversations.result?.length > 0 &&
          navContext.displayedConversations.result.map(
            (conversation, index) => {
              return (
                <Convo
                  key={conversation.userId}
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
            }
          )}
      </div>
    </>
  );
};
export default ConvoBox;
