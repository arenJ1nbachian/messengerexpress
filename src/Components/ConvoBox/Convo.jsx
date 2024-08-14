import { useContext, useEffect, useState } from "react";
import Category from "../NavBarButtons/Category";
import { SocketContext } from "../../Contexts/SocketContext";
import defaultPicture from "../../images/default.svg";

const Convo = ({
  index,
  navContext,
  picture,
  conversation,
  setConvoHovered,
  convoHovered,
  unread,
  conversationId,
}) => {
  const [lastMessage, setLastMessage] = useState(conversation.lastMessage);
  const [who, setWho] = useState(conversation.who);

  return (
    <div
      key={conversation.userId}
      className={`userConvo ${
        navContext.selectedChat === index + 1 ? "clicked" : "default"
      } ${convoHovered === index + 1 ? "hovered" : "default"}`}
      onMouseEnter={() => setConvoHovered(index + 1)}
      onMouseLeave={() => setConvoHovered(-1)}
      onClick={() => {
        navContext.setSelectedChat(index + 1);
        navContext.setCompose(false);
        navContext.setShowsearchField(true);
        navContext.setSelectedElement(null);
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
        <div id="flName">{`${conversation.name}`}</div>
        <div
          id="latest-message"
          className={`${
            conversation.read === false && who.length === 0 ? "unread" : ""
          }`}
        >{`${who} ${lastMessage}`}</div>
      </div>
      {conversation.read === false && who.length === 0 && (
        <div className="unreadIcon">
          <Category img={unread} width="100%" height="100%" />
        </div>
      )}
    </div>
  );
};

export default Convo;
