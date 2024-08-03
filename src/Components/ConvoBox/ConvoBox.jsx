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
                <div
                  key={index + 1}
                  className={`userConvo ${
                    navContext.selectedChat === index + 1
                      ? "clicked"
                      : "default"
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
