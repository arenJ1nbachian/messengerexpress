import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import { useNavigate } from "react-router";
import Category from "./Category";
import "./Button.css";

const Button = ({ value, index, buttonText }) => {
  const navBar = useContext(NavContext);
  const navigate = useNavigate();

  const handleNavigation = (destination) => {
    if (destination === "chats") {
      !navBar.compose ? navigate(`chats`) : navigate("/chats/compose");
    } else if (destination === "people") {
      switch (navBar.compose) {
        case true:
          navigate(`people/none`);
          break;
        case false:
          navigate(`people`);
          break;
        default:
          break;
      }
    } else if (destination === "requests") {
      switch (navBar.compose) {
        case true:
          navigate(`requests/none`);
          break;
        case false:
          navigate(`requests/`);
          break;
        default:
          break;
      }
    } else if (destination === "archived") {
      switch (navBar.compose) {
        case true:
          navigate(`archived/none`);
          break;
        case false:
          navigate(`archived/`);
          break;
        default:
          break;
      }
    }
  };

  const handleNavButtonClick = (index) => {
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
        <Category img={value} />
      </div>
      {navBar.navExpanded && <div className="btnText">{buttonText[index]}</div>}
    </div>
  );
};

export default Button;
