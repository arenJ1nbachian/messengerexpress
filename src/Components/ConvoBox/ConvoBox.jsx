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

          const convoMap = new Map(result.map((c) => [c._id, c]));

          navContext.setDisplayedConversations(convoMap);
          sessionStorage.setItem(
            "displayedConversations",
            JSON.stringify([...convoMap])
          );
          navContext.setIsConvosFullyLoaded(true);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (!navContext.isConvosFullyLoaded) {
      displayConvo();
    }
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
            navContext.compose ? "clicked" : "default"
          } ${convoHovered === 0 ? "hovered" : "default"}`}
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
        {navContext.displayedConversations.size > 0 &&
          Array.from(navContext.displayedConversations).map(
            ([id, conversation], index) => (
              <Convo
                key={id}
                id={id}
                picture={conversation.profilePicture}
                setConvoHovered={setConvoHovered}
                convoHovered={convoHovered}
                unread={unread}
              />
            )
          )}
      </div>
    </>
  );
};

export default ConvoBox;
