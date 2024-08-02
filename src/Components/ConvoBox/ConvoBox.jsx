import { useContext, useEffect, useState } from "react";
import Category from "../NavBarButtons/Category";
import defaultPicture from "../../images/default.svg";
import "./ConvoBox.css";
import { NavContext } from "../../Contexts/NavContext";
import unread from "../../images/unread.svg";

const ConvoBox = () => {
  const [hovered, setHovered] = useState(-1);
  const [convoHovered, setConvoHovered] = useState(-1);

  const navContext = useContext(NavContext);

  useEffect(() => {
    navContext.setDisplayedConversations();
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
        {navContext.displayedConversations.result?.length > 0 &&
          navContext.displayedConversations.result.map(
            (conversation, index) => {
              return (
                <div
                  key={index}
                  className={`userConvo ${
                    navContext.selectedChat === index ? "clicked" : "default"
                  } ${convoHovered === index ? "hovered" : "default"}`}
                  onMouseEnter={() => setConvoHovered(index)}
                  onMouseLeave={() => setConvoHovered(-1)}
                  onClick={() => navContext.setSelectedChat(index)}
                >
                  <div id="pfPicture">
                    <img
                      className="convoPicture"
                      src={
                        navContext.displayedPictures.profilePicturesUrl[
                          index
                        ] === null
                          ? defaultPicture
                          : navContext.displayedPictures.profilePicturesUrl[
                              index
                            ]
                      }
                      alt="profilePic"
                    />
                  </div>
                  <div className="convoInfo">
                    <div id="flName">{`${conversation.name}`}</div>
                    <div
                      id="latest-message"
                      className={`${
                        conversation.read === false &&
                        conversation.who.length === 0
                          ? "unread"
                          : ""
                      }`}
                    >{`${conversation.who} ${conversation.lastMessage}`}</div>
                  </div>
                  {conversation.read === false &&
                    conversation.who.length === 0 && (
                      <div className="unreadIcon">
                        <Category img={unread} width="100%" height="100%" />
                      </div>
                    )}
                </div>
              );
            }
          )}
      </div>
    </>
  );
};
export default ConvoBox;
