import { useContext, useEffect } from "react";
import { NavContext } from "../../Contexts/NavContext";
import Category from "./Category";
import Settings from "./Settings";
import Chevron from "./Chevron";

const AccButton = ({ account }) => {
  const navBar = useContext(NavContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navBar.settingsRef.current &&
        !navBar.settingsRef.current.contains(event.target) &&
        !event.target.closest(".accButton")
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
  }, [navBar.showSettings, navBar]);

  return (
    <>
      <div
        className="accButton"
        onMouseEnter={() => (navBar.navExpanded ? navBar.setHovered(4) : false)}
        onMouseLeave={() =>
          navBar.navExpanded ? navBar.setHovered(-1) : false
        }
        onClick={() => navBar.setShowSettings(!navBar.showSettings)}
        style={{
          marginTop: "auto",
          backgroundColor:
            navBar.navExpanded && navBar.hovered === 4
              ? "rgba(255, 255, 255, 0.1)"
              : "transparent",

          width: navBar.navExpanded ? "13vw" : "3vw",
          display: "flex",
          flexDirection: "row",
          border: "2px solid transparent",
          borderRadius: "10px",
          marginBottom: "2vh",
        }}
      >
        <div
          className="accButton"
          onMouseEnter={() =>
            navBar.navExpanded ? false : navBar.setHovered(4)
          }
          onMouseLeave={() =>
            navBar.navExpanded ? false : navBar.setHovered(-1)
          }
          onClick={() => navBar.setShowSettings(!navBar.showSettings)}
          style={{
            backgroundColor:
              !navBar.navExpanded && navBar.hovered === 4
                ? "rgba(255, 255, 255, 0.1)"
                : "transparent",
            marginTop: "auto",
            width: "50px",
            height: "50px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid transparent",
            borderRadius: "10px",
          }}
        >
          <Category img={account} />
        </div>
        {navBar.navExpanded && (
          <div
            style={{
              textAlign: "center",
              alignContent: "center",
              fontWeight: "bold",
              fontSize: "18px",
              color: "White",
              fontFamily:
                "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
            }}
          >
            {"Aren"}
          </div>
        )}
      </div>
      <Settings />
      {navBar.navExpanded && <Chevron />}
    </>
  );
};

export default AccButton;
