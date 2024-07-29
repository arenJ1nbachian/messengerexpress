import "./Login.css";

const Register = () => {
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
          <div className="title"> New Here?</div>
          <div className="desc">
            Sign up now to discover and connect with like-minded individuals
            through our messaging app.
          </div>
          <div className="desc">
            Expand your network and engage in meaningful conversations
            effortlessly.
          </div>
          <button className="rgstrBtn">Sign up</button>
        </div>
      </div>
    </>
  );
};

export default Register;
