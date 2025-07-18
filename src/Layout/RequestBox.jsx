import { useContext } from "react";
import { NavContext } from "../Contexts/NavContext";
import defaultPicture from "../images/default.svg";
import { useNavigate } from "react-router";
import { RequestContext } from "../Contexts/RequestContext";

const RequestBox = ({
  id,
  picture,
  setConvoHovered,
  convoHovered,
  request,
}) => {
  const requestContext = useContext(RequestContext);

  return (
    <div
      className={`userConvo ${convoHovered === id ? "hovered" : "default"} ${
        requestContext.selectedRequest === id ? "clicked" : "default"
      }`}
      onMouseEnter={() => setConvoHovered(id)}
      onMouseLeave={() => setConvoHovered(null)}
      onClick={() => {
        requestContext.setSelectedRequest(id);
        requestContext.selectedRequestRef.current = id;
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
        <div id="idHeader">
          <div
            id="flName"
            style={{ fontWeight: "bolder", color: "black" }}
          >{`${request.name} `}</div>
        </div>
        <div
          id="latest-message"
          style={{ fontWeight: "bold", color: "black" }}
        >{`${request.who} ${request.lastMessage.content}`}</div>
      </div>
    </div>
  );
};

export default RequestBox;
