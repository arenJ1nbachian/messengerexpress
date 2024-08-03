import { Category } from "@mui/icons-material";
import send from "../images/send.svg";
import "./ComposeMessage.css";
import { useContext, useEffect, useState } from "react";
import { NavContext } from "../Contexts/NavContext";
import defaultPicture from "../images/default.svg";

const ComposeMessage = () => {
  const [usersFound, setUsersFound] = useState([]);
  const navContext = useContext(NavContext);
  const [searchUserHovered, setSearchUserHovered] = useState(-1);

  useEffect(() => {
    console.log(usersFound);
    console.log(navContext.selectedComposeHtmlTag);
  }, [usersFound, navContext.selectedComposeHtmlTag]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  const handleChange = async (e) => {
    if (e.target.value[0] !== " " && e.target.value.length > 0) {
      try {
        const res = await fetch(
          "http://localhost:5000/api/users/search/" + e.target.value,
          {
            method: "POST",
            body: JSON.stringify({ userId: sessionStorage.getItem("userId") }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const result = await res.json();
          setUsersFound(result.result);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      setUsersFound([]);
    }
  };

  const debouncedHandleChange = debounce(handleChange, 300);

  return (
    <>
      <div className="composeHeader">
        <div className="to">To:</div>
        <input
          onChange={debouncedHandleChange}
          type="text"
          autoComplete="off"
          id="userName"
          placeholder=""
        />
        <div className="searchBox">
          {usersFound.map((user, index) => (
            <div
              onClick={(e) =>
                navContext.setSelectedElement({
                  picture: user.profilePicture || defaultPicture,
                  name: user.firstname + " " + user.lastname,
                })
              }
              onMouseEnter={() => setSearchUserHovered(index)}
              onMouseLeave={() => setSearchUserHovered(-1)}
              key={index}
              className={`userSearch 
              } ${searchUserHovered === index ? "hovered" : "default"}`}
            >
              <div id="pfPicture">
                <img
                  id="searchUser"
                  className="convoPicture"
                  src={user.profilePicture || defaultPicture}
                  alt="profilePic"
                />
              </div>
              <div className="convoInfo">
                <div id="flName">{`${user.firstname} ${user.lastname}`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat"></div>
      <div className="chatInput">
        <input type="text" autoComplete="off" id="userName" placeholder="Aa" />
        <div
          style={{
            marginLeft: "auto",
            marginRight: "1vw",
            cursor: "pointer",
          }}
        >
          <Category img={send} width="100%" height="100%" />
        </div>
      </div>
    </>
  );
};

export default ComposeMessage;
