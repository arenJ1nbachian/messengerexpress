import { useContext, useEffect, useState } from "react";
import defaultPicture from "../../images/default.svg";
import "./ConvoBox.css";
import unread from "../../images/unread.svg";
import Convo from "./Convo";
import { ConversationContext } from "../../Contexts/ConversationContext";
import { ComposeContext } from "../../Contexts/ComposeContext";

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
  const convoContext = useContext(ConversationContext);
  const composeContext = useContext(ComposeContext);

  /**
   * This effect is used to get the conversations of the user
   * and to join the conversations using the socket.
   */
  useEffect(() => {
    const displayConvo = async () => {
      try {
        convoContext.isConvosFullyLoaded.current = true;
        console.log("Getting conversations");
        const conversations = await fetch(
          "http://localhost:5000/api/conversations/getConvos/" +
            sessionStorage.getItem("userId"),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            method: "GET",
          }
        );

        if (conversations.ok) {
          const result = await conversations.json();

          const convoMap = new Map(result.map((c) => [c._id, c]));

          convoContext.setDisplayedConversations(convoMap);
          sessionStorage.setItem(
            "displayedConversations",
            JSON.stringify([...convoMap])
          );
          convoContext.setSelectedConversation(
            result[0]._id ? result[0]._id : null
          );
          convoContext.selectedConversationRef.current = result[0]._id
            ? result[0]._id
            : null;
          sessionStorage.setItem(
            "selectedConversation",
            result[0]._id ? result[0]._id : null
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (sessionStorage.getItem("displayedConversations") === null) {
      displayConvo();
    }
  }, []);

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
          onMouseEnter={() => setConvoHovered(0)}
          onMouseLeave={() => setConvoHovered(-1)}
          onClick={() => {
            composeContext.setCompose(true);
            convoContext.setSelectedConversation(null);
            convoContext.selectedConversationRef.current = null;
            sessionStorage.removeItem("selectedConversation");
          }}
          className={`userConvo ${
            composeContext.compose || composeContext.selectedElement
              ? "show"
              : "hidden"
          } ${composeContext.compose ? "clicked" : "default"} ${
            convoHovered === 0 ? "hovered" : "default"
          }`}
        >
          <div id="pfPicture">
            <img
              className="convoPicture"
              src={
                composeContext.selectedElement === null
                  ? defaultPicture
                  : composeContext.selectedElement.picture
              }
              alt="profilePic"
            />
          </div>
          <div className="convoInfo">
            <div id="flName">{`New message ${
              composeContext.selectedElement === null
                ? ""
                : "to " + composeContext.selectedElement.name
            }`}</div>
          </div>
        </div>
        {convoContext.displayedConversations.size > 0 &&
          Array.from(convoContext.displayedConversations).map(
            ([id, conversation]) => (
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
