import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import { useNavigate } from "react-router";
import Category from "./Category";
import "./Button.css";
import { ConversationContext } from "../../Contexts/ConversationContext";
import { ComposeContext } from "../../Contexts/ComposeContext";
import { RequestContext } from "../../Contexts/RequestContext";
import { handleNavButtonChange } from "../../utils/handleNavButtonChange";

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
  const navigate = useNavigate();
  const convoContext = useContext(ConversationContext);
  const composeContext = useContext(ComposeContext);
  const navContext = useContext(NavContext);
  const requestContext = useContext(RequestContext);

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
    if (index !== navContext.selected) {
      navContext.setSelected(index);
      switch (index) {
        case 0:
          handleNavButtonChange(
            "chats",
            navigate,
            composeContext,
            convoContext,
            requestContext
          );
          break;
        case 1:
          handleNavButtonChange(
            "people",
            navigate,
            composeContext,
            convoContext,
            requestContext
          );
          break;
        case 2:
          handleNavButtonChange(
            "requests",
            navigate,
            composeContext,
            convoContext,
            requestContext
          );
          break;
        case 3:
          handleNavButtonChange(
            "archived",
            navigate,
            composeContext,
            convoContext,
            requestContext
          );
          break;
        default:
          break;
      }
    }
  };

  return (
    <div
      className={`btnBox ${
        navContext.selected === index || navContext.hovered === index
          ? " hovClick"
          : "default"
      } ${navContext.navExpanded && "Expanded"}`}
      onMouseEnter={() => navContext.setHovered(index)}
      onMouseLeave={() => navContext.setHovered(-1)}
      onClick={() => handleNavButtonClick(index)}
    >
      <div
        className={`btnIconBox`}
        key={index}
        onMouseEnter={() =>
          navContext.navExpanded ? false : navContext.setHovered(index)
        }
        onMouseLeave={() =>
          navContext.navExpanded ? false : navContext.setHovered(-1)
        }
        onClick={() => handleNavButtonClick(index)}
      >
        {index === 2 &&
          !navContext.navExpanded &&
          requestContext.requestCount !== 0 && (
            <div className="reqNum">{requestContext.requestCount}</div>
          )}
        <Category img={value} />
      </div>
      {navContext.navExpanded && (
        <div className="btnText">{buttonText[index]}</div>
      )}
      {index === 2 &&
        navContext.navExpanded &&
        requestContext.requestCount !== 0 && (
          <div className="reqNumExpanded">{requestContext.requestCount}</div>
        )}
    </div>
  );
};

export default Button;
