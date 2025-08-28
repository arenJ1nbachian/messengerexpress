import { useNavigate } from "react-router";
import "./Login&Register.css";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../Contexts/UserContext";
import logo from "../images/messengerLogo.png";
import pfp from "../images/imgUpload.svg";

/**
 * Handles the login functionality
 *
 * @returns JSX.Element
 */
const Login = () => {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    file: null,
  });
  const firstNameInputRef = useRef();
  const lastNameInputRef = useRef();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();
  const [pfpPreview, setPfpPreview] = useState(pfp);
  const [error, setError] = useState("");
  const errorBanner = useRef();
  const [removeError, setRemoveError] = useState(null);
  const leftSide = useRef();
  const rightSide = useRef();
  const container = useRef();
  const [mode, setMode] = useState(sessionStorage.getItem("mode") || "Login");
  const formRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      console.log(window.innerWidth);
      if (
        window.innerWidth <= 1000 ||
        (window.innerHeight < 800 && mode === "Register") ||
        (window.innerHeight < 505 && mode === "Login")
      ) {
        console.log("SMALL SCREEN");
        container.current.style.flexDirection = "column";
      } else if (window.innerWidth > 1000 && mode === "Login") {
        console.log("BIG SCREEN LOGIN MODE");
        container.current.style.flexDirection = "row";
      } else if (window.innerWidth > 1000 && mode === "Register") {
        console.log("BIG SCREEN REGISTER MODE");
        container.current.style.flexDirection = "row-reverse";
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mode]);

  /**
   * Checks if the form is valid
   *
   * @returns boolean
   */
  const formIsValid = () => {
    let valid = true;
    if (mode === "Login") {
      if (formData.email.length === 0) {
        emailInputRef.current.style.borderColor = "red";
        valid = false;
      } else {
        emailInputRef.current.style.borderColor = "#ccc";
      }
      if (formData.password.length === 0) {
        passwordInputRef.current.style.borderColor = "red";
        valid = false;
      } else {
        passwordInputRef.current.style.borderColor = "#ccc";
      }
    } else {
      if (formData.email.length === 0) {
        emailInputRef.current.style.borderColor = "red";
        valid = false;
      } else {
        emailInputRef.current.style.borderColor = "#ccc";
      }
      if (formData.firstname.length === 0) {
        firstNameInputRef.current.style.borderColor = "red";
        valid = false;
      } else {
        firstNameInputRef.current.style.borderColor = "#ccc";
      }
      if (formData.lastname.length === 0) {
        lastNameInputRef.current.style.borderColor = "red";
        valid = false;
      } else {
        lastNameInputRef.current.style.borderColor = "#ccc";
      }
      if (formData.password.length === 0) {
        passwordInputRef.current.style.borderColor = "red";
        valid = false;
      } else {
        passwordInputRef.current.style.borderColor = "#ccc";
      }
      if (formData.confirmPassword.length === 0) {
        confirmPasswordInputRef.current.style.borderColor = "red";
        valid = false;
      } else {
        confirmPasswordInputRef.current.style.borderColor = "#ccc";
      }
    }

    if (!valid) {
      setError("Error: Field is required");
      errorBanner.current.style.opacity = "1";
      setRemoveError(
        setTimeout(() => {
          errorBanner.current.style.opacity = "0";
          setRemoveError(null);
        }, 5000)
      );
    }
    return valid;
  };

  const handleSubmitRegister = async (e) => {
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
        const res = await fetch(
          `${process.env.production.REACT_APP_API_BASE}/api/users/register`,
          {
            method: "POST",
            body: data,
          }
        );

        if (res.ok) {
          const result = await res.json();
          console.log(result);
          navigate("/login");
          setMode("Login");
          resetForm();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const resetForm = () => {
    setTimeout(() => {
      setPfpPreview(pfp);
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
        file: null,
      });
    }, 500);

    emailInputRef.current.style.borderColor = "#ccc";
    passwordInputRef.current.style.borderColor = "#ccc";

    if (mode === "Register") {
      firstNameInputRef.current.style.borderColor = "#ccc";
      lastNameInputRef.current.style.borderColor = "#ccc";
      emailInputRef.current.style.borderColor = "#ccc";
      passwordInputRef.current.style.borderColor = "#ccc";
      confirmPasswordInputRef.current.style.borderColor = "#ccc";
    }

    errorBanner.current.style.opacity = "0";
    clearTimeout(removeError);
    setRemoveError(null);
  };

  const handleRegisterLoginClick = () => {
    resetForm();
    if (mode === "Login") {
      if (window.innerWidth > 1000) {
        leftSide.current.style.opacity = "0";
        rightSide.current.style.opacity = "0";
        setTimeout(() => {
          setMode("Register");
          sessionStorage.setItem("mode", "Register");
          navigate("/register");
          container.current.style.flexDirection = "row-reverse";
          leftSide.current.style.opacity = "1";
          rightSide.current.style.opacity = "1";
        }, 500);
      } else {
        formRef.current.style.opacity = "0";
        setTimeout(() => {
          setMode("Register");
          sessionStorage.setItem("mode", "Register");
          navigate("/register");
          formRef.current.style.opacity = "1";
        }, 500);
      }
    } else {
      if (window.innerWidth > 1000) {
        leftSide.current.style.opacity = "0";
        rightSide.current.style.opacity = "0";
        setTimeout(() => {
          setMode("Login");
          sessionStorage.setItem("mode", "Login");
          navigate("/login");
          container.current.style.flexDirection = "row";
          leftSide.current.style.opacity = "1";
          rightSide.current.style.opacity = "1";
        }, 500);
      } else {
        formRef.current.style.opacity = "0";
        setTimeout(() => {
          setMode("Login");
          sessionStorage.setItem("mode", "Login");
          navigate("/login");
          formRef.current.style.opacity = "1";
        }, 500);
      }
    }
  };

  /**
   * Handles the form submission
   *
   * @param {Event} e - The event object
   */
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (formIsValid()) {
      try {
        const res = await fetch(
          `${process.env.production.REACT_APP_API_BASE}/api/users/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          console.log(data);
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("userId", data.userId);
          userContext.login(data.userId, data.token);
          navigate("/");
        } else {
          emailInputRef.current.style.borderColor = "red";
          passwordInputRef.current.style.borderColor = "red";
          if (removeError === null) {
            setError("Error: Invalid credentials");
            errorBanner.current.style.opacity = "1";
            setRemoveError(
              setTimeout(() => {
                errorBanner.current.style.opacity = "0";
                setRemoveError(null);
              }, 5000)
            );
          }
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
      <div ref={container} className="container">
        <div ref={leftSide} className="left-side">
          {mode === "Login" ? (
            <img src={logo} alt="login" id="logo" />
          ) : (
            <div>
              <img
                onClick={() => document.getElementById("pfpInput").click()}
                src={pfpPreview}
                alt="pfp"
                id="pfp"
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
          )}

          <div ref={errorBanner} className="alert">
            <span class="material-symbols-outlined">priority_high</span>
            <span>{error}</span>
          </div>
          <h1>
            {mode === "Login"
              ? "Login to Messenger"
              : "Create your new Account"}
          </h1>
          {mode === "Register" ? (
            <form
              ref={formRef}
              onSubmit={handleSubmitRegister}
              className="login-form"
            >
              <div className="input-group">
                <label htmlFor="firstname">
                  <i className="fas fa-user"></i> First Name
                </label>
                <input
                  ref={firstNameInputRef}
                  onFocus={() => {
                    firstNameInputRef.current.style.borderColor = "#4a90e2";
                  }}
                  onBlur={() => {
                    firstNameInputRef.current.style.borderColor = "#ccc";
                  }}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={formData.firstname}
                  type="text"
                  id="firstname"
                  name="firstname"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="input-group">
                <label htmlFor="lastname">
                  <i className="fas fa-user"></i> Last Name
                </label>
                <input
                  ref={lastNameInputRef}
                  onFocus={() => {
                    lastNameInputRef.current.style.borderColor = "#4a90e2";
                  }}
                  onBlur={() => {
                    lastNameInputRef.current.style.borderColor = "#ccc";
                  }}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={formData.lastname}
                  type="text"
                  id="lastname"
                  name="lastname"
                  placeholder="Enter your last name"
                />
              </div>
              <div className="input-group">
                <label htmlFor="email">
                  <i className="fas fa-user"></i> Email
                </label>
                <input
                  ref={emailInputRef}
                  onFocus={() => {
                    emailInputRef.current.style.borderColor = "#4a90e2";
                  }}
                  onBlur={() => {
                    emailInputRef.current.style.borderColor = "#ccc";
                  }}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={formData.email}
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i> Password
                </label>
                <input
                  ref={passwordInputRef}
                  onFocus={() => {
                    passwordInputRef.current.style.borderColor = "#4a90e2";
                  }}
                  onBlur={() => {
                    passwordInputRef.current.style.borderColor = "#ccc";
                  }}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={formData.password}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i> Confirm Password
                </label>
                <input
                  ref={confirmPasswordInputRef}
                  onFocus={() => {
                    confirmPasswordInputRef.current.style.borderColor =
                      "#4a90e2";
                  }}
                  onBlur={() => {
                    confirmPasswordInputRef.current.style.borderColor = "#ccc";
                  }}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={formData.confirmPassword}
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                />
              </div>
              <button type="submit" className="btn-login">
                {mode === "Login" ? "Login" : "Register"}
              </button>
            </form>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmitLogin}
              className="login-form"
            >
              <div className="input-group">
                <label htmlFor="email">
                  <i className="fas fa-user"></i> Email
                </label>
                <input
                  ref={emailInputRef}
                  onFocus={() => {
                    emailInputRef.current.style.borderColor = "#4a90e2";
                  }}
                  onBlur={() => {
                    emailInputRef.current.style.borderColor = "#ccc";
                  }}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={formData.email}
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i> Password
                </label>
                <input
                  ref={passwordInputRef}
                  onFocus={() => {
                    passwordInputRef.current.style.borderColor = "#4a90e2";
                  }}
                  onBlur={() => {
                    passwordInputRef.current.style.borderColor = "#ccc";
                  }}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  value={formData.password}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="btn-login">
                {mode === "Login" ? "Login" : "Register"}
              </button>
            </form>
          )}
        </div>
        <div ref={rightSide} className="right-side">
          <div className="register-info">
            <h2>{mode === "Login" ? "New here?" : "Already with us?"}</h2>
            {mode === "Login" ? (
              <p>
                Create an account to start chatting with your friends and family
                instantly.
              </p>
            ) : (
              <p>
                Welcome back! Sign in to reconnect with your community.
                <br />
                Continue the conversations you care about by signing in now
              </p>
            )}
            <button
              onClick={handleRegisterLoginClick}
              href="/register"
              className="btn-register"
            >
              {mode === "Login" ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
