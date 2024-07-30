import { useNavigate } from "react-router";
import "./Login.css";

const Register = () => {
  const navigate = useNavigate();
  return (
    <>
      <div style={{ display: "flex" }}>
        <div className="login">
          <div className="title">Create your new account</div>
          <div className="email">
            <input
              type="text"
              autoComplete="off"
              id="email"
              placeholder="Email"
            />
          </div>
          <div className="password">
            <input
              type="text"
              autoComplete="off"
              id="password"
              placeholder="Password"
            />
          </div>

          <button className="loginBtn">Sign up</button>
        </div>
        <div className="side">
          <div className="sideTitle"> Already with us?</div>
          <div className="desc">
            Welcome back! Sign in to reconnect with your community.
          </div>
          <div className="desc">
            Continue the conversations you care about by signing in now.
          </div>
          <button onClick={() => navigate("/login")} className="rgstrBtn">
            Sign in
          </button>
        </div>
      </div>
    </>
  );
};

export default Register;
