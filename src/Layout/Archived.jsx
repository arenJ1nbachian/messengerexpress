import { useContext, useEffect } from "react";
import { NavContext } from "../Contexts/NavContext";
import { useNavigate } from "react-router";
import { ComposeContext } from "../Contexts/ComposeContext";
import { ConversationContext } from "../Contexts/ConversationContext";

const Archived = () => {
  const navContext = useContext(NavContext);
  const composeContext = useContext(ComposeContext);
  const convoContext = useContext(ConversationContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !composeContext.compose &&
      convoContext.selectedConversationRef.current
    ) {
      navigate(`/archived/${convoContext.selectedConversationRef.current}`);
    } else {
      navigate("/archived/none");
    }
  }, [composeContext.compose, convoContext.selectedConversationRef, navigate]);
  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div
        className={`chatBox ${navContext.navExpanded ? "expanded" : "default"}`}
      >
        <div className="chatBoxContactHeader">
          <div className="chatBoxContactTitle">Archived Chats</div>
        </div>
      </div>
    </div>
  );
};

export default Archived;
