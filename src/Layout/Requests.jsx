import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import { useNavigate } from "react-router";
import { SocketContext } from "../Contexts/SocketContext";
import RequestBox from "./RequestBox";
import "./Requests.css";
import norequestPicture from "../images/norequest.png";
import { ComposeContext } from "../Contexts/ComposeContext";
import { ConversationContext } from "../Contexts/ConversationContext";
import { RequestContext } from "../Contexts/RequestContext";
const REACT_APP_API_BASE = process.env.REACT_APP_API_BASE;

/**
 * This component is used to display the requests page of the chat application.
 * It uses the `NavContext` to determine which conversation to display and
 * navigates to the corresponding conversation page using the `useNavigate`
 * hook.
 *
 * @returns {JSX.Element} The JSX element representing the requests page.
 */
const Requests = () => {
  useContext(SocketContext);
  const [convoHovered, setConvoHovered] = useState(-1);
  const requestContext = useContext(RequestContext);
  const navContext = useContext(NavContext);

  useEffect(() => {
    const getRequests = async () => {
      try {
        const requests = await fetch(
          `${REACT_APP_API_BASE}/api/conversations/getRequests/` +
            sessionStorage.getItem("userId"),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        if (requests.ok) {
          const result = await requests.json();
          if (result.requests.length > 0) {
            const requests = new Map(
              result.requests
                .map((r) => [r._id, r])
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            );
            requestContext.setRequests(requests);
            sessionStorage.setItem(
              "requests",
              JSON.stringify(Array.from(requests.entries()))
            );
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    if (requestContext.requestCount !== 0) {
      getRequests();
    }
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div
        className={`chatBox ${navContext.navExpanded ? "expanded" : "default"}`}
      >
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Requests</div>
        </div>
        {requestContext.requests.size > 0 ? (
          Array.from(requestContext.requests).map(([key, request]) => {
            return (
              <RequestBox
                key={key}
                id={request._id}
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
