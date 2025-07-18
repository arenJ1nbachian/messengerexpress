import { useContext, useEffect } from "react";
import { NavContext } from "../Contexts/NavContext";

const Archived = () => {
  const navContext = useContext(NavContext);

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
