import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import AccountAndSettings from "./AccountAndSettings";

const Settings = () => {
  const navBar = useContext(NavContext);
  return (
    <>
      {navBar.showSettings && (
        <div
          style={{
            position: "absolute",
            top: navBar.navExpanded ? "40vh" : "31vh",
            right: navBar.navExpanded ? "75vw" : "auto",
          }}
          ref={navBar.settingsRef}
        >
          <AccountAndSettings />
        </div>
      )}
    </>
  );
};
export default Settings;
