import { useContext } from "react";
import { NavContext } from "../Contexts/NavContext";
import defaultPicture from "../images/default.svg";
import { useNavigate } from "react-router";

const RequestBox = ({
  key,
  index,
  picture,
  setConvoHovered,
  convoHovered,
  request,
}) => {
  const navContext = useContext(NavContext);
  const navigate = useNavigate();
  return (
    <div
      key={key}
      className={`userConvo ${
        navContext.selectedChat === index + 1 ? "clicked" : "default"
      } ${convoHovered === index + 1 ? "hovered" : "default"}`}
      onMouseEnter={() => setConvoHovered(index + 1)}
      onMouseLeave={() => setConvoHovered(-1)}
      onClick={() => {
        navigate("/requests/" + request._id);
        navContext.setSelectedRequest(request);
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
          <div id="flName">{`${request.name} `}</div>
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
