import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import { useNavigate } from "react-router";
import Category from "./Category";
import "./Button.css";

const Button = ({ value, index, buttonText }) => {
  const navBar = useContext(NavContext);
  const navigate = useNavigate();

  const handleNavButtonClick = (index) => {
    navBar.setSelected(index);
    switch (index) {
      case 0:
        navigate("chats");
        break;
      case 1:
        navigate("people");
        break;
      case 2:
        navigate("requests");
        break;
      case 3:
        navigate("archived");
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
