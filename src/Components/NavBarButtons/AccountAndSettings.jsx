import React, { useContext, useState } from "react";
import settings from "../../images/settings.svg";
import restricted from "../../images/restriced.svg";
import security from "../../images/security.svg";
import supervision from "../../images/supervision.svg";
import help from "../../images/help.svg";
import report from "../../images/report.svg";
import policy from "../../images/policy.svg";
import messenger from "../../images/messenger.svg";
import logout from "../../images/logout.svg";
import edge from "../../images/icon.svg";
import "../../CSS/ScrollBar.css";
import "./AccountAndSettings.css";
import { UserContext } from "../../Contexts/UserContext";
import { useNavigate } from "react-router";
import { NavContext } from "../../Contexts/NavContext";
import { SocketContext } from "../../Contexts/SocketContext";

/**
 * AccountAndSettings component
 * This component displays the settings panel when the `showSettings` state in the NavContext is true.
 * It displays the account settings as a list of options.
 *
 * @returns {JSX.Element} The JSX element representing the settings panel.
 */
const AccountAndSettings = () => {
  const userContext = useContext(UserContext);
  const navBarContext = useContext(NavContext);
  const [hovered, setHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(-1);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  /**
   * The list of account settings that are displayed in the panel.
   * @type {string[]}
   */
  const accountSettings = [
    "Preferences",
    "Restricted accounts",
    "Privacy & safety",
    "Supervision",
    "Help",
    "Report a problem",
    "Terms",
    "Privacy Policy",
    "Cookie Policy",
    "Try Messenger for Mac",
    "Log out",
  ];

  /**
   * The list of SVG sources that are used to display the icons in the panel.
   * @type {string[]}
   */
  const accountSettingsSvg = [
    settings,
    restricted,
    security,
    supervision,
    help,
    report,
    policy,
    messenger,
    logout,
  ];

  return (
    <>
      <div>
        <div
          className={`scrollBar settingsBox ${hovered ? "hovered" : ""}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {accountSettings.map((setting, index) => {
            let src;
            if (index > 5 && index < 9) {
              src = accountSettingsSvg[6];
            } else if (index === 9) {
              src = accountSettingsSvg[7];
            } else if (index === 10) {
              src = accountSettingsSvg[8];
            } else {
              src = accountSettingsSvg[index];
            }
            return (
              <React.Fragment key={index}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (index === 10) {
                      // If the user clicks on the log out button, disconnect the socket and log out the user.
                      socket.disconnect();
                      userContext.logout();
                      sessionStorage.removeItem("token");
                      sessionStorage.removeItem("userId");
                      navBarContext.setShowSettings(false);
                      navigate("/");
                    }
                  }}
                  className={`optionBox ${index === 0 ? "firstOption" : ""} ${
                    index === accountSettings.length - 1 ? "lastOption" : ""
                  } ${buttonHovered === index ? "optionHovered" : ""}`}
                  key={index}
                  onMouseEnter={() => setButtonHovered(index)}
                  onMouseLeave={() => setButtonHovered(-1)}
                >
                  <img width="25px" height="25px" src={src} alt="settings" />
                  <strong style={{ fontSize: "14px" }}>{setting}</strong>
                </div>
                {index !== 4 &&
                  index !== 6 &&
                  index !== 7 &&
                  index !== 9 &&
                  index !== 10 && <hr />}
              </React.Fragment>
            );
          })}
        </div>
        <img src={edge} alt="." />
      </div>
    </>
  );
};

export default AccountAndSettings;
