import { useContext, useEffect } from "react";
import defaultPicture from "../images/default.svg";
import { RequestContext } from "../Contexts/RequestContext";
import { ConversationContext } from "../Contexts/ConversationContext";
import { useNavigate } from "react-router";

const RequestBox = ({
  id,
  picture,
  setConvoHovered,
  convoHovered,
  request,
}) => {
  const requestContext = useContext(RequestContext);
  const conversationContext = useContext(ConversationContext);
  const navigate = useNavigate();

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
        conversationContext.setSelectedConversation(null);
        conversationContext.selectedConversationRef.current = null;
        sessionStorage.removeItem("selectedConversation");
        sessionStorage.setItem("selectedRequest", id);
        navigate(`/requests/${id}`);
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
