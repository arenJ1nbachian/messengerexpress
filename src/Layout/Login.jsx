import "./Login.css";

const Login = () => {
  return (
    <>
      <div style={{ display: "flex" }}>
        <div className="login">
          <div className="title">Login to Your Account</div>
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

          <button className="loginBtn">Login</button>
        </div>
        <div className="side">
          <div className="title"> Already with us?</div>
          <div className="desc">
            Welcome back! Sign in to reconnect with your community.
          </div>
          <div className="desc">
            Continue the conversations you care about by signing in now.
          </div>
          <button className="rgstrBtn">Sign In</button>
        </div>
      </div>
    </>
  );
};

export default Login;
