import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import { useNavigate } from "react-router";
import Category from "./Category";
import "./Button.css";

/**
 * The Button component is used to display a button in the navigation bar.
 * It takes two props, `value` and `index`, which are used to determine the
 * icon and text displayed in the button. The `buttonText` prop is used to
 * display the text in the button when the navigation bar is expanded.
 *
 * The component uses the `useContext` hook to get the `NavContext` and the
 * `useNavigate` hook to navigate to the correct page when the button is
 * clicked.
 *
 * The component also uses the `handleNavigation` function to navigate to the
 * correct page based on the value of `destination`.
 *
 * The component is rendered as a `div` with a class of `btnBox` and a child
 * `div` with a class of `btnIconBox` which contains the icon and text.
 *
 * When the button is hovered over, the `hovClick` class is added to the
 * `btnBox` and `btnIconBox` elements. When the button is clicked, the
 * `hovClick` class is removed from the `btnBox` and `btnIconBox` elements.
 *
 * The component also uses the `handleNavButtonClick` function to set the
 * selected button index and navigate to the correct page based on the value
 * of `index`.
 */
const Button = ({ value, index, buttonText }) => {
  const navBar = useContext(NavContext);
  const navigate = useNavigate();

  /**
   * The handleNavigation function is used to navigate to the correct page
   * based on the value of `destination`.
   *
   * If the value of `destination` is "chats", the function navigates to the
   * "chats" page. If the value of `destination` is "people", the function
   * navigates to the "people" page. If the value of `destination` is "requests",
   * the function navigates to the "requests" page. If the value of
   * `destination` is "archived", the function navigates to the "archived" page.
   * If the value of `destination` is not one of the above, the function does
   * nothing.
   *
   * @param {string} destination The value of the destination to navigate to.
   */
  const handleNavigation = (destination) => {
    if (destination === "chats") {
      navBar.selectedChatDetails?.current
        ? navigate(`chats/${navBar.selectedChatDetails.current._id}`)
        : navigate(`chats`);
    } else if (destination === "people") {
      switch (navBar.compose) {
        case true:
          navigate(`people/none`);
          navBar.setCompose(false);
          break;
        case false:
          navigate(`people`);
          if (navBar.displayedConversations.length > 0) {
            navBar.setDisplayedConversations([]);
          }
          break;
        default:
          break;
      }
    } else if (destination === "requests") {
      switch (navBar.compose) {
        case true:
          navigate(`requests/none`);
          navBar.setCompose(false);
          break;
        case false:
          navigate(`requests/`);
          if (navBar.displayedConversations.length > 0) {
            navBar.setDisplayedConversations([]);
          }
          break;
        default:
          break;
      }
    } else if (destination === "archived") {
      switch (navBar.compose) {
        case true:
          navigate(`archived/none`);
          navBar.setCompose(false);
          break;
        case false:
          navigate(`archived/`);
          if (navBar.displayedConversations.length > 0) {
            navBar.setDisplayedConversations([]);
          }
          break;
        default:
          break;
      }
    }
  };

  /**
   * The handleNavButtonClick function is used to set the selected button index
   * and navigate to the correct page based on the value of `index`.
   *
   * If the value of `index` is 0, the function sets the selected button index to
   * 0 and navigates to the "chats" page. If the value of `index` is 1, the
   * function sets the selected button index to 1 and navigates to the "people"
   * page. If the value of `index` is 2, the function sets the selected button
   * index to 2 and navigates to the "requests" page. If the value of `index` is
   * 3, the function sets the selected button index to 3 and navigates to the
   * "archived" page. If the value of `index` is not one of the above, the
   * function does nothing.
   *
   * @param {number} index The value of the index to set the selected button
   * index to.
   */
  const handleNavButtonClick = (index) => {
    if (index !== navBar.selected) {
      navBar.setSelected(index);
      switch (index) {
        case 0:
          handleNavigation("chats");
          break;
        case 1:
          handleNavigation("people");
          break;
        case 2:
          handleNavigation("requests");
          break;
        case 3:
          handleNavigation("archived");
          break;
        default:
          break;
      }
      navBar.setSelectedRequest(null);
    }
  };

  return (
    <div
      className={`btnBox ${
        navBar.navExpanded &&
        (navBar.selected === index || navBar.hovered === index)
          ? " hovClick"
          : "default"
      }`}
      onMouseEnter={() =>
        navBar.navExpanded ? navBar.setHovered(index) : false
      }
      onMouseLeave={() => (navBar.navExpanded ? navBar.setHovered(-1) : false)}
      onClick={() => handleNavButtonClick(index)}
    >
      <div
        className={`btnIconBox ${
          !navBar.navExpanded &&
          (navBar.selected === index || navBar.hovered === index)
            ? " hovClick"
            : "default"
        }`}
        key={index}
        onMouseEnter={() =>
          navBar.navExpanded ? false : navBar.setHovered(index)
        }
        onMouseLeave={() =>
          navBar.navExpanded ? false : navBar.setHovered(-1)
        }
        onClick={() => handleNavButtonClick(index)}
      >
        {index === 2 && !navBar.navExpanded && navBar.requestCount !== 0 && (
          <div className="reqNum">1</div>
        )}
        <Category img={value} />
      </div>
      {navBar.navExpanded && <div className="btnText">{buttonText[index]}</div>}
      {index === 2 && navBar.navExpanded && navBar.requestCount !== 0 && (
        <div className="reqNumExpanded">1</div>
      )}
    </div>
  );
};

export default Button;
