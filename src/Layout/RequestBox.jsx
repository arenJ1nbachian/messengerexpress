import { useContext } from "react";
import { NavContext } from "../Contexts/NavContext";
import defaultPicture from "../images/default.svg";
import { useNavigate } from "react-router";

const RequestBox = ({
  id,
  picture,
  setConvoHovered,
  convoHovered,
  request,
  setClickedRequest,
}) => {
  const navContext = useContext(NavContext);
  const navigate = useNavigate();
  return (
    <div
      className={`userConvo ${convoHovered === id ? "hovered" : "default"} ${
        navContext.selectedRequest === id ? "clicked" : "default"
      }`}
      onMouseEnter={() => setConvoHovered(id)}
      onMouseLeave={() => setConvoHovered(null)}
      onClick={() => {
        navigate("/requests/" + request._id);
        navContext.setSelectedRequest(request._id);
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
            style={{ fontWeight: "bolder", color: "white" }}
          >{`${request.name} `}</div>
        </div>
        <div
          id="latest-message"
          style={{ fontWeight: "bold", color: "white" }}
        >{`${request.who} ${
          request.lastMessage === null
            ? request.lastMessage
            : request.lastMessage
        }`}</div>
      </div>
    </div>
  );
};

export default RequestBox;
