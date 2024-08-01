import { useContext, useEffect } from "react";
import { NavContext } from "../../Contexts/NavContext";
import Category from "./Category";
import Settings from "./Settings";
import Chevron from "./Chevron";
import accountIcon from "../../images/accountIcon.svg";
import "./AccButton.css";

const AccButton = ({ account, loggedName }) => {
  const navBar = useContext(NavContext);

  useEffect(() => {
    console.log("logged name: " + loggedName);
    const handleClickOutside = (event) => {
      if (
        navBar.settingsRef.current &&
        !navBar.settingsRef.current.contains(event.target) &&
        !event.target.closest(".accBtnBox")
      ) {
        console.log("Closing settings");
        navBar.setShowSettings(false);
      }
    };
    console.log(navBar.showSettings);
    if (navBar.showSettings) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      console.log("Cleaning up");
      document.removeEventListener("click", handleClickOutside);
    };
  }, [navBar.showSettings, navBar, loggedName]);

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
