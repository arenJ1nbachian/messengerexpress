import { useNavigate } from "react-router";
import "./Login.css";
import { useState } from "react";
import pfp from "../images/imgUpload.svg";

const Register = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const [pfpPreview, setPfpPreview] = useState(pfp);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    file: null,
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
      const data = new FormData();
      data.append("firstname", formData.firstname);
      data.append("lastname", formData.lastname);
      data.append("email", formData.email);
      data.append("password", formData.password);
      if (formData.file) {
        data.append("file", formData.file);
      }

      try {
        const res = await fetch("http://localhost:5000/api/users/register", {
          method: "POST",
          body: data,
        });

        if (res.ok) {
          const result = await res.json();
          console.log(result);
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
            <div
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className={`pfp ${hovered ? "hovered" : ""}`}
            >
              <input
                onClick={() => document.getElementById("pfpInput").click()}
                type="image"
                src={pfpPreview}
                alt="pfp"
                style={{
                  width: pfpPreview === pfp ? "60%" : "100%",
                  height: pfpPreview === pfp ? "60%" : "100%",
                }}
              />
              <input
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setPfpPreview(URL.createObjectURL(e.target.files[0]));
                    setFormData((prevData) => ({
                      ...prevData,
                      file: e.target.files[0],
                    }));
                  }
                }}
                id="pfpInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
              />
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
