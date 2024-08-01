import { useContext, useState } from "react";
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

const AccountAndSettings = () => {
  const userContext = useContext(UserContext);
  const [hovered, setHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(-1);
  const navigate = useNavigate();
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
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (index === 10) {
                      console.log("test");
                      userContext.logout();
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
              </>
            );
          })}
        </div>
        <img src={edge} alt="." />
      </div>
    </>
  );
};

export default AccountAndSettings;
