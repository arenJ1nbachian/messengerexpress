import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import { useNavigate } from "react-router";
import { SocketContext } from "../Contexts/SocketContext";
import RequestBox from "./RequestBox";
import "./Requests.css";
import norequestPicture from "../images/norequest.png";

/**
 * This component is used to display the requests page of the chat application.
 * It uses the `NavContext` to determine which conversation to display and
 * navigates to the corresponding conversation page using the `useNavigate`
 * hook.
 *
 * @returns {JSX.Element} The JSX element representing the requests page.
 */
const Requests = () => {
  const navBar = useContext(NavContext);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [convoHovered, setConvoHovered] = useState(-1);

  /**
   * This effect is used to navigate to the correct conversation page when the
   * user navigates to the requests page.
   *
   * If the user has selected a conversation, navigate to the conversation page
   * with the corresponding ID. Otherwise, navigate to the "none" page.
   */
  useEffect(() => {
    if (
      navBar.selectedChatDetails?.current &&
      !navBar.compose &&
      navBar.selectedChat !== 0
    ) {
      navigate(`/requests/${navBar.selectedChatDetails?.current._id}`);
    } else {
      navigate("/requests/none");
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("newRequest", (request) => {
        console.log("NEW REQUEST", request);
      });
      socket.on("removeFromRequests", (request) => {});
    }

    return () => {
      if (socket) {
        socket.off("newRequest");
        socket.off("removeFromRequests");
      }
    };
  }, [socket]);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Requests</div>
        </div>
        {navBar.requests?.length > 0 ? (
          navBar.requests.map((request, index) => {
            return (
              <RequestBox
                key={request._id}
                index={index}
                picture={request.profilePicture}
                setConvoHovered={setConvoHovered}
                convoHovered={convoHovered}
                request={request}
              />
            );
          })
        ) : (
          <div className="noConversations">
            <img src={norequestPicture} alt="no request" />
            <h3>No Message Requests</h3>
            <h6>
              {"You're all caught up!"}
              <br />
              {
                "Why not check in with your friends or explore new conversations?"
              }
              <br />
              {"Unless if you don't have friends, then why not make some?"}
              <br />
              {"If you can't then go cry in a corner."}
            </h6>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
