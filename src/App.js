import "./App.css";
import Contacts from "./Layout/Contacts.jsx";
import Chat from "./Layout/Chat.jsx";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Root from "./Layout/Root.jsx";
import Requests from "./Layout/Requests.jsx";
import Archived from "./Layout/Archived.jsx";
import { NavContext } from "./Contexts/NavContext.js";
import { useCallback, useRef, useState } from "react";
import Login from "./Layout/Login.jsx";
import Register from "./Layout/Register.jsx";
import { UserContext } from "./Contexts/UserContext.js";

const handleDefaultNavigation = () => {
  const selected = sessionStorage.getItem("selected");

  switch (selected) {
    case "0":
      return <Navigate to="/chats" replace />;
    case "1":
      return <Navigate to="/people" replace />;
    case "2":
      return <Navigate to="/requests" replace />;
    case "3":
      return <Navigate to="/archived" replace />;
    default:
      return <Navigate to="/chats" replace />;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "/", element: <Navigate to="/login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
]);

const loggedInRouter = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "/", element: handleDefaultNavigation() },
      { path: "chats", element: <Chat /> },
      { path: "people", element: <Contacts /> },
      { path: "requests", element: <Requests /> },
      { path: "archived", element: <Archived /> },
    ],
  },
]);

const App = () => {
  const [navExpanded, setNavExpanded] = useState(
    JSON.parse(sessionStorage.getItem("navExpanded")) || false
  );
  const [hovered, setHovered] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const [selected, setSelected] = useState(
    JSON.parse(sessionStorage.getItem("selected")) || 0
  );
  const [selectedChat, setSelectedChat] = useState(-1);
  const [selectChatDetails, setSelectChatDetails] = useState({});
  const [displayedConversations, setDisplayedConversations] = useState([]);

  const [token, setToken] = useState(sessionStorage.getItem("token") || false);
  const [userId, setUserId] = useState(
    sessionStorage.getItem("userId") || false
  );

  const login = useCallback((uid, token) => {
    setToken(token);
    setUserId(uid);
  }, []);
  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
  }, []);

  const handleNavExpand = useCallback((value) => {
    setNavExpanded(value);
    sessionStorage.setItem("navExpanded", value);
  }, []);

  const handleSelected = useCallback((value) => {
    setSelected(value);
    sessionStorage.setItem("selected", value);
  }, []);

  const handleHovered = useCallback((value) => {
    setHovered(value);
  }, []);

  const handleShowSettings = useCallback((value) => {
    setShowSettings(value);
  }, []);

  const handleSelectedChatDetails = useCallback(async (value) => {
    try {
      const res = await fetch("", {
        method: "GET",
      });
    } catch (error) {
      console.log(error);
    }

    setSelectChatDetails(value);
  }, []);

  const handleDisplayedConversations = useCallback(async (value) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/conversations/getConvos/" +
          sessionStorage.getItem("userId"),
        {
          method: "GET",
        }
      );

      if (res.ok) {
        const result = await res.json();
        setDisplayedConversations(result);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ isLoggedIn: !!token, token, userId, login, logout }}
    >
      <NavContext.Provider
        value={{
          navExpanded: navExpanded,
          setNavExpanded: handleNavExpand,
          selected,
          setSelected: handleSelected,
          hovered,
          setHovered: handleHovered,
          showSettings,
          setShowSettings: handleShowSettings,
          settingsRef,
          selectedChat,
          setSelectedChat,
          selectChatDetails,
          setSelectChatDetails: handleSelectedChatDetails,
          displayedConversations,
          setDisplayedConversations: handleDisplayedConversations,
        }}
      >
        <RouterProvider
          router={!!token && !!userId ? loggedInRouter : router}
        />
      </NavContext.Provider>
    </UserContext.Provider>
  );
};

export default App;
