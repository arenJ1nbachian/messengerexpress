import { useNavigate } from "react-router";
import "./Login.css";
import { useContext, useState } from "react";
import { UserContext } from "../Contexts/UserContext";

const Login = () => {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const formIsValid = () => {
    return formData.email.length !== 0 && formData.password.length !== 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formIsValid()) {
      try {
        const res = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log(data);
          userContext.login(data.userId, data.token);
          navigate("/chats");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Form is not valid");
    }
  };
  return (
    <>
      <div style={{ display: "flex" }}>
        <div className="login">
          <div className="title">Login to Your Account</div>
          <form onSubmit={handleSubmit}>
            <div className="email">
              <input
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    [e.target.name]: e.target.value,
                  }))
                }
                type="text"
                name="email"
                autoComplete="off"
                id="email"
                placeholder="Email"
              />
            </div>
            <div className="password">
              <input
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    [e.target.name]: e.target.value,
                  }))
                }
                type="text"
                name="password"
                autoComplete="off"
                id="password"
                placeholder="Password"
              />
            </div>
            <div>
              <input type="submit" placeholder="Login" className="loginBtn" />
            </div>
          </form>
        </div>
        <div className="side">
          <div className="title"> New Here?</div>
          <div className="desc">
            Sign up now to discover and connect with like-minded individuals
            through our messaging app.
          </div>
          <div className="desc">
            Expand your network and engage in meaningful conversations
            effortlessly.
          </div>

          <button onClick={() => navigate("/register")} className="rgstrBtn">
            Sign Up
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
