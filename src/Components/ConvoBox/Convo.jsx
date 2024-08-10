import { useEffect, useState } from "react";
import Category from "../NavBarButtons/Category";
import typingGif from "../../images/typing.gif";

const Convo = ({
  index,
  navContext,
  defaultPicture,
  conversation,
  setConvoHovered,
  convoHovered,
  unread,
}) => {
  const [isTyping, setIsTyping] = useState(false);

  // Define the function to handle typing events
  const handleTyping = (data) => {
    if (
      data.sender === conversation.userId &&
      data.room === navContext.currentRoom
    ) {
      setIsTyping(data.isTyping);
    }
  };

  // Listen for 'isTyping' events specific to this conversation
  navContext.socket.on("isTyping", handleTyping);

  // Clean up the event listener when the component unmounts

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
          src={
            navContext.displayedPictures.profilePicturesUrl[index] === null
              ? defaultPicture
              : navContext.displayedPictures.profilePicturesUrl[index]
          }
          alt="profilePic"
        />
      </div>
      <div className="convoInfo">
        <div id="flName">{`${conversation.name}`}</div>
        <div
          id="latest-message"
          className={`${
            conversation.read === false && conversation.who.length === 0
              ? "unread"
              : ""
          }`}
        >{`${conversation.who} ${conversation.lastMessage}`}</div>
      </div>
      {isTyping && (
        <div className="typing-indicator">
          <img src={typingGif} alt="Typing..." />
        </div>
      )}
      {conversation.read === false && conversation.who.length === 0 && (
        <div className="unreadIcon">
          <Category img={unread} width="100%" height="100%" />
        </div>
      )}
    </div>
  );
};

export default Convo;
