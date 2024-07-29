import Category from "../Components/NavBarButtons/Category";
import defaultPicture from "../images/default.svg";
import send from "../images/send.svg";
import "./ChatBox.css";

const Chatbox = () => {
  return (
    <>
      <div className="recipient">
        <div className="uPicture">
          <Category img={defaultPicture} width="100%" height="100%" />
        </div>
        <div className="uInfo">
          <div className="uName">Aren Jinbachian</div>
          <div className="uActive">Active 10h ago</div>
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
export default Chatbox;
