import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import Category from "./Category";
import chevronLeft from "../../images/chevronL.svg";
import chevronRight from "../../images/chevronR.svg";

const Chevron = () => {
  const navBar = useContext(NavContext);

  const handleExpanded = () => {
    navBar.setHovered(-1);
    navBar.setNavExpanded(!navBar.navExpanded);
  };
  return (
    <>
      {navBar.navExpanded && (
        <div
          onMouseEnter={() => navBar.setHovered(5)}
          onMouseLeave={() => navBar.setHovered(-1)}
          onClick={handleExpanded}
          style={{
            display: "flex",
            backgroundColor:
              navBar.hovered === 5 ? "rgba(255, 255, 255, 0.1)" : "transparent",
            width: "3vw",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid transparent",
            borderRadius: "10px",
            marginBottom: "2vh",
          }}
        >
          <Category
            img={navBar.navExpanded === true ? chevronLeft : chevronRight}
          />
        </div>
      )}
      {!navBar.navExpanded && (
        <div
          onMouseEnter={() => navBar.setHovered(5)}
          onMouseLeave={() => navBar.setHovered(-1)}
          onClick={handleExpanded}
          style={{
            backgroundColor:
              navBar.hovered === 5 ? "rgba(255, 255, 255, 0.1)" : "transparent",

            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid transparent",
            borderRadius: "10px",
            marginBottom: "2vh",
          }}
        >
          <Category
            img={navBar.navExpanded === true ? chevronLeft : chevronRight}
          />
        </div>
      )}
    </>
  );
};
export default Chevron;
