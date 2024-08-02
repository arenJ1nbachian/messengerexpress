import { useContext, useEffect, useState } from "react";
import Category from "../NavBarButtons/Category";
import defaultPicture from "../../images/default.svg";
import "./ConvoBox.css";
import { NavContext } from "../../Contexts/NavContext";

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
                    <Category img={defaultPicture} width="75%" height="75%" />
                  </div>
                  <div className="convoInfo">
                    <div id="flName">{`${conversation.name}`}</div>
                    <div id="latest-message">{`${conversation.who} ${conversation.lastMessage}`}</div>
                  </div>
                </div>
              );
            }
          )}
      </div>
    </>
  );
};
export default ConvoBox;
