import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import AccountAndSettings from "./AccountAndSettings";
import "./Settings.css";

/**
 * Settings component
 * This component displays the settings panel when the `showSettings` state in the NavContext is true.
 * It adjusts its position based on whether the nav bar is expanded.
 *
 * @returns {JSX.Element} The JSX element representing the settings panel.
 */
const Settings = () => {
  const navBar = useContext(NavContext); // Access NavContext to get the current state of the nav bar

  return (
    <>
      {navBar.showSettings && ( // Conditionally render the settings panel
        <div
          className={`position ${navBar.navExpanded ? "expanded" : ""}`} // Adjust position class based on navExpansion
          ref={navBar.settingsRef} // Attach ref for potential DOM manipulation
        >
          <AccountAndSettings /> {/* Render Account and Settings component */}
        </div>
      )}
    </>
  );
};

export default Settings;
