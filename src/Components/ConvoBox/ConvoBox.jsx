import { useState } from "react";
import Category from "../NavBarButtons/Category";
import defaultPicture from "../../images/default.svg";

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
        className="chat-container"
        style={{
          marginTop: "2vh",
          marginLeft: "auto",
          marginRight: "auto",
          borderBottom: "3px solid rgb(45,45,45)",
          height: "70%",
          width: "95%",
          overflowY: hovered === true ? "scroll" : "hidden",
        }}
      >
        {conversations.map((index) => {
          return (
            <div
              onMouseEnter={() => setConvoHovered(index)}
              onMouseLeave={() => setConvoHovered(-1)}
              onClick={() => setConvoClicked(index)}
              style={{
                display: "flex",
                alignItems: "center",
                width: "99%",
                height: "12vh",
                backgroundColor:
                  convoClicked === index
                    ? "rgb(65,65,65)"
                    : convoHovered === index
                    ? "rgb(51,51,51)"
                    : "transparent",
                borderRadius: "15px",
              }}
            >
              <div
                id="pfPicture"
                style={{
                  marginLeft: "5%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "70px",
                  height: "70px",
                }}
              >
                <Category img={defaultPicture} />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1vh",
                  marginLeft: "1vw",
                }}
              >
                <div
                  id="flName"
                  style={{
                    fontWeight: "bold",
                    height: "50%",
                    fontSize: "20px",
                    fontFamily:
                      "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                    color: "White",
                  }}
                >
                  FirstName_LastName
                </div>
                <div
                  id="latest-message"
                  style={{
                    height: "50%",
                    fontSize: "17px",
                    fontFamily:
                      "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                    color: "rgb(176,179,184)",
                  }}
                >
                  Recent_Message_Of_This_Convo
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
export default ConvoBox;
