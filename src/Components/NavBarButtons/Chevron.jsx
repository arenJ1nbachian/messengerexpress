import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import Category from "./Category";
import chevronLeft from "../../images/chevronL.svg";
import chevronRight from "../../images/chevronR.svg";
import "./Chevron.css";

const Chevron = () => {
  const navBar = useContext(NavContext);

  const handleExpanded = () => {
    navBar.setHovered(-1);
    navBar.setNavExpanded(!navBar.navExpanded);
  };
  return (
    <>
      <div
        className={`chevron ${navBar.hovered === 5 ? "hovered" : ""} ${
          navBar.navExpanded ? "expanded" : ""
        }`}
        onMouseEnter={() => navBar.setHovered(5)}
        onMouseLeave={() => navBar.setHovered(-1)}
        onClick={handleExpanded}
      >
        <Category
          img={navBar.navExpanded === true ? chevronLeft : chevronRight}
        />
      </div>
    </>
  );
};
export default Chevron;
