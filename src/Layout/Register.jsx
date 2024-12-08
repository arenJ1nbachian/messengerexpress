import { useNavigate } from "react-router";
import "./Login.css";
import { useState } from "react";
import pfp from "../images/imgUpload.svg";

/**
 * Register component.
 *
 * This component is responsible for rendering the registration form
 * and handling the submission of the form.
 *
 * @returns {JSX.Element} The rendered component.
 */
const Register = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  /**
   * State for the preview of the profile picture.
   *
   * When the user selects a new image, this state is updated
   * and the preview is updated accordingly.
   */
  const [pfpPreview, setPfpPreview] = useState(pfp);

  /**
   * State for the form data.
   *
   * This state is updated when the user types something in the form.
   * It is used to store the data that will be sent to the server.
   */
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    file: null,
  });

  /**
   * Checks if the form is valid.
   *
   * This function checks if the form data is valid and returns
   * true if it is, or false if it's not.
   *
   * @returns {boolean} If the form is valid or not.
   */
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

  /**
   * Handles the submission of the form.
   *
   * This function is called when the user submits the form. It checks
   * if the form is valid and if it is, it sends the data to the server.
   *
   * @param {Event} e The event that triggered the function.
   */
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
              <button
                type="button"
                onClick={(e) => document.getElementById("pfpInput").click()}
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  padding: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <img
                  src={pfpPreview}
                  alt="pfp"
                  style={{
                    width: pfpPreview === pfp ? "60%" : "100%",
                    height: pfpPreview === pfp ? "60%" : "100%",
                    display: "block",
                    margin: "auto",
                    borderRadius: "50%",
                  }}
                />
              </button>

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
