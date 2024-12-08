import { useContext, useEffect } from "react";
import { NavContext } from "../../Contexts/NavContext";
import Category from "./Category";
import Settings from "./Settings";
import Chevron from "./Chevron";
import accountIcon from "../../images/accountIcon.svg";
import "./AccButton.css";

/**
 * AccButton component
 * This component displays the account icon and username in the navigation bar.
 * If the navigation bar is expanded, the account icon is replaced with a chevron icon.
 * Clicking on the account icon toggles the settings panel.
 * @param {Object} account - The account object
 * @param {String} loggedName - The username of the logged in user
 * @returns {JSX.Element} The JSX element representing the account button.
 */
const AccButton = ({ account, loggedName }) => {
  const navBar = useContext(NavContext);

  /**
   * Handle the click outside event.
   * This function is called when the user clicks outside of the settings panel.
   * It checks if the click is outside of the panel and if the panel is currently open.
   * If both conditions are met, it closes the panel.
   * @param {Event} event - The click event
   */
  const handleClickOutside = (event) => {
    if (
      navBar.settingsRef.current &&
      !navBar.settingsRef.current.contains(event.target) &&
      !event.target.closest(".accBtnBox")
    ) {
      navBar.setShowSettings(false);
    }
  };

  /**
   * UseEffect hook that handles the click outside event.
   * It adds the event listener when the settings panel is open and removes it when it is closed.
   */
  useEffect(() => {
    if (navBar.showSettings) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [navBar.showSettings]);

  return (
    <>
      <div
        className={`accBtnBox ${navBar.hovered === 4 ? "Hovered" : "default"} ${
          navBar.navExpanded ? "Expanded" : "default"
        }`}
        onMouseEnter={() => (navBar.navExpanded ? navBar.setHovered(4) : false)}
        onMouseLeave={() =>
          navBar.navExpanded ? navBar.setHovered(-1) : false
        }
        onClick={() => navBar.setShowSettings(!navBar.showSettings)}
      >
        <div
          className="accIconBox"
          onMouseEnter={() =>
            navBar.navExpanded ? false : navBar.setHovered(4)
          }
          onMouseLeave={() =>
            navBar.navExpanded ? false : navBar.setHovered(-1)
          }
          onClick={() => navBar.setShowSettings(!navBar.showSettings)}
        >
          {" "}
          {account !== null ? (
            <img
              src={account}
              width="95%"
              height="95%"
              alt="icons"
              style={{ borderRadius: "50%" }}
            />
          ) : (
            <Category img={accountIcon} />
          )}
        </div>
        {navBar.navExpanded && <div className="accName">{loggedName}</div>}
      </div>
      <Settings />
      {navBar.navExpanded && <Chevron />}
    </>
  );
};

export default AccButton;
