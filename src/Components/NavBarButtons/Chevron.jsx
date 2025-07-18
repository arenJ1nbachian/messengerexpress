import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import Category from "./Category";
import chevronLeft from "../../images/chevronL.svg";
import chevronRight from "../../images/chevronR.svg";
import "./Chevron.css";

/**
 * Chevron component
 *
 * This component renders a chevron button that toggles the expanded state of the nav bar.
 * It changes appearance based on whether the nav bar is hovered or expanded.
 *
 * @returns {JSX.Element} The JSX element representing the chevron button.
 */
const Chevron = () => {
  const navBar = useContext(NavContext); // Access NavContext to get the current state and functions of the nav bar

  /**
   * handleExpanded
   *
   * Toggles the expanded state of the nav bar and resets the hovered state.
   */
  const handleExpanded = () => {
    navBar.setHovered(-1); // Reset hovered state
    navBar.setNavExpanded(!navBar.navExpanded); // Toggle expanded state
  };

  return (
    <>
      <div
        className={`chevron ${navBar.hovered === 5 ? "hovered" : ""} ${
          navBar.navExpanded ? "expanded" : ""
        }`}
        onMouseEnter={() => navBar.setHovered(5)} // Set hovered state on mouse enter
        onMouseLeave={() => navBar.setHovered(-1)} // Reset hovered state on mouse leave
        onClick={handleExpanded} // Toggle expanded state on click
      >
        <Category img={chevronRight} width="28px" height="28px" />
      </div>
    </>
  );
};
export default Chevron;
