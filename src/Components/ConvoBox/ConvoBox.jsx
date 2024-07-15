import { useState } from "react";
import Category from "../NavBarButtons/Category";
import defaultPicture from "../../images/default.svg";
import "./ConvoBox.css";

const ConvoBox = () => {
  const [hovered, setHovered] = useState(-1);
  const [convoHovered, setConvoHovered] = useState(-1);
  const [convoClicked, setConvoClicked] = useState(-1);
  const conversations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
        }}
        className={`scrollBar convoBox ${hovered ? "hovered" : "default"}`}
      >
        {conversations.map((index) => {
          return (
            <div
              className={`userConvo ${
                convoClicked === index
                  ? "clicked"
                  : convoHovered === index
                  ? "hovered"
                  : "default"
              }`}
              onMouseEnter={() => setConvoHovered(index)}
              onMouseLeave={() => setConvoHovered(-1)}
              onClick={() => setConvoClicked(index)}
            >
              <div id="pfPicture">
                <Category img={defaultPicture} width="75%" height="75%" />
              </div>
              <div className="convoInfo">
                <div id="flName">FirstName_LastName</div>
                <div id="latest-message">Recent_Message_Of_This_Convo</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
export default ConvoBox;
