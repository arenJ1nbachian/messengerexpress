import { useContext, useEffect } from "react";
import { NavContext } from "../Contexts/NavContext";
import Chatbox from "./ChatBox";
import { Outlet, useNavigate } from "react-router";

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

  /**
   * This effect is used to navigate to the correct conversation page when the
   * user navigates to the requests page.
   *
   * If the user has selected a conversation, navigate to the conversation page
   * with the corresponding ID. Otherwise, navigate to the "none" page.
   */
  useEffect(() => {
    if (
      navBar.displayedConversations.length !== 0 &&
      !navBar.compose &&
      navBar.selectedChat !== 0
    ) {
      navigate(
        `/requests/${
          navBar.displayedConversations[navBar.selectedChat - 1]._id
        }`
      );
    } else {
      navigate("/requests/none");
    }
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div className={`chatBox ${navBar.navExpanded ? "expanded" : "default"}`}>
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Requests</div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Requests;
