import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import AccountAndSettings from "./AccountAndSettings";
import "./Settings.css";

const Settings = () => {
  const navBar = useContext(NavContext);
  return (
    <>
      {navBar.showSettings && (
        <div
          className={`position ${navBar.navExpanded ? "expanded" : ""}`}
          ref={navBar.settingsRef}
        >
          <AccountAndSettings />
        </div>
      )}
    </>
  );
};
export default Settings;
