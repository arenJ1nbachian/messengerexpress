import { useContext } from "react";
import { NavContext } from "../../Contexts/NavContext";
import { useNavigate } from "react-router";
import Category from "./Category";

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
      onMouseEnter={() =>
        navBar.navExpanded ? navBar.setHovered(index) : false
      }
      onMouseLeave={() => (navBar.navExpanded ? navBar.setHovered(-1) : false)}
      onClick={() => handleNavButtonClick(index)}
      style={{
        backgroundColor:
          navBar.navExpanded &&
          (navBar.selected === index || navBar.hovered === index)
            ? "rgba(255, 255, 255, 0.1)"
            : "transparent",

        width: "16vw",
        display: "flex",
        flexDirection: "row",
        border: "2px solid transparent",
        borderRadius: "10px",
      }}
    >
      <div
        key={index}
        onMouseEnter={() =>
          navBar.navExpanded ? false : navBar.setHovered(index)
        }
        onMouseLeave={() =>
          navBar.navExpanded ? false : navBar.setHovered(-1)
        }
        onClick={() => handleNavButtonClick(index)}
        style={{
          backgroundColor:
            !navBar.navExpanded &&
            (navBar.selected === index || navBar.hovered === index)
              ? "rgba(255, 255, 255, 0.1)"
              : "transparent",

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
        <Category img={value} />
      </div>
      {navBar.navExpanded && (
        <div
          style={{
            marginLeft: "1vw",
            textAlign: "center",
            alignContent: "center",
            fontWeight: "bold",
            fontSize: "18px",
            color: "White",
            fontFamily:
              "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
          }}
        >
          {buttonText[index]}
        </div>
      )}
    </div>
  );
};

export default Button;
