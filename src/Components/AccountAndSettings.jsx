import { useState } from "react";
import settings from "../images/settings.svg";
import restricted from "../images/restriced.svg";
import security from "../images/security.svg";
import supervision from "../images/supervision.svg";
import help from "../images/help.svg";
import report from "../images/report.svg";
import policy from "../images/policy.svg";
import messenger from "../images/messenger.svg";
import logout from "../images/logout.svg";

import "./AccountAndSettings.css";

const AccountAndSettings = () => {
  const [hovered, setHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(-1);
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
          className="chat-container"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            backgroundColor: "rgb(45,45,45)",
            borderRadius: "15px",
            width: "19vw",
            height: "50vh",
            display: "flex",
            flexDirection: "column",
            color: "white",
            overflowY: hovered === true ? "scroll" : "hidden",
          }}
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
                  key={index}
                  onMouseEnter={() => setButtonHovered(index)}
                  onMouseLeave={() => setButtonHovered(-1)}
                  style={{
                    marginTop: index === 0 ? "1vh" : "0vh",
                    width: "85%",
                    minHeight: "7vh",

                    backgroundColor:
                      buttonHovered === index
                        ? "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                    borderRadius: "10px",
                    marginLeft: "1vw",
                    paddingLeft: "1vw",
                    display: "flex",
                    alignItems: "center",
                    gap: "1vw",
                  }}
                >
                  <img width="25px" height="25px" src={src} alt="settings" />
                  <strong style={{ fontSize: "14px" }}>{setting}</strong>
                </div>
                {index !== 4 &&
                  index !== 6 &&
                  index !== 7 &&
                  index !== 9 &&
                  index !== 10 && (
                    <hr
                      style={{
                        width: "80%",
                        color: "white",
                        border: "1px solid rgb(62,64,66)",
                      }}
                    />
                  )}
              </>
            );
          })}
        </div>
        <svg
          height="12"
          viewBox="0 0 25 12"
          width="25"
          style={{
            color: "rgb(45,45,45)",
            transform: "scale(1.5, 1.5) translate(12px, -2px) rotate(0deg)",
          }}
        >
          <path
            clipRule="evenodd"
            d="M9.67157 9.17157C11.2337 10.7337 13.7663 10.7337 15.3284 9.17157L24.5 0L0.5 0L9.67157 9.17157Z"
            fill="rgb(45, 45, 45)"
          ></path>
        </svg>
      </div>
    </>
  );
};

export default AccountAndSettings;
