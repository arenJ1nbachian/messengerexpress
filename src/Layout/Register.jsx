import { useNavigate } from "react-router";
import "./Login.css";
import { useState } from "react";
import pfp from "../images/imgUpload.svg";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const formIsValid = () => {
    return (
      formData.firstname.length !== 0 &&
      formData.lastname.length !== 0 &&
      formData.email.length !== 0 &&
      formData.password.length !== 0 &&
      formData.confirmPassword.length !== 0 &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formIsValid()) {
      try {
        const res = await fetch("http://localhost:5000/api/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log(data);
          navigate("/login");
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
          <div className="title">Create your new account</div>
          <form onSubmit={handleSubmit}>
            <div className="pfp">
              <input type="image" src={pfp} alt="pfp" />
            </div>
            <div className="nameInputs">
              <div className="firstname">
                <input
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  type="text"
                  name="firstname"
                  autoComplete="off"
                  id="firstname"
                  placeholder="First Name"
                />
              </div>
              <div className="lastname">
                <input
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  type="text"
                  name="lastname"
                  autoComplete="off"
                  id="lastname"
                  placeholder="Last Name"
                />
              </div>
            </div>

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
                type="password"
                name="password"
                autoComplete="off"
                id="password"
                placeholder="Password"
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
                type="password"
                name="confirmPassword"
                autoComplete="off"
                id="confirmPassword"
                placeholder="Confirm Password"
              />
            </div>
            <div>
              <input type="submit" value="Register" className="loginBtn" />
            </div>
          </form>
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
