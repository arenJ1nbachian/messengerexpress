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
import { useCallback, useEffect, useRef, useState } from "react";
import Login from "./Layout/Login.jsx";
import Register from "./Layout/Register.jsx";
import { UserContext } from "./Contexts/UserContext.js";

import { SocketContext } from "./Contexts/SocketContext.js";
import io from "socket.io-client";
import Chatbox from "./Layout/ChatBox.jsx";
import ComposeMessage from "./Layout/ComposeMessage.jsx";

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
      { path: "people", element: <Contacts /> },
      { path: "requests", element: <Requests /> },
      { path: "archived", element: <Archived /> },
      {
        path: "chats",
        element: <Chat />,
        children: [
          { path: ":id", element: <Chatbox /> },
          { path: "compose", element: <ComposeMessage /> },
        ],
      },
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
  const conversationRef = useRef(null);
  const [selectedChat, setSelectedChat] = useState(
    JSON.parse(sessionStorage.getItem("selectedChat")) === 0
      ? 1
      : JSON.parse(sessionStorage.getItem("selectedChat")) !== null
      ? JSON.parse(sessionStorage.getItem("selectedChat"))
      : 1
  );
  const [selectChatDetails, setSelectChatDetails] = useState({});
  const [displayedConversations, setDisplayedConversations] = useState([]);
  const [displayedPictures, setDisplayedPictures] = useState([]);
  const [token, setToken] = useState(sessionStorage.getItem("token") || false);
  const [userId, setUserId] = useState(
    sessionStorage.getItem("userId") || false
  );
  const [compose, setCompose] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showsearchField, setShowsearchField] = useState(true);
  const searchFieldRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if ((token, userId)) {
      console.log("His user id is", userId);
      setSocket(
        io("http://localhost:5000", {
          query: { uid: userId },
        })
      );
    }
  }, []);

  const composeOff = useCallback((bool, convoID) => {
    if (!bool) {
      setCompose(false);
      setSelectedElement(null);
    } else {
      setCompose(true);
    }
  }, []);

  const login = useCallback((uid, token) => {
    setToken(token);
    setUserId(uid);
    setSocket(
      io("http://localhost:5000", {
        query: { uid },
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setSelected(0);
    setSelectedChat(-1);
    setSelectedElement(null);
    setNavExpanded(false);
    sessionStorage.clear();
    setCompose(false);
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
    /*  try {
      const res = await fetch("", {
        method: "GET",
      });
    } catch (error) {
      console.log(error);
    }

    setSelectChatDetails(value);*/
  }, []);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
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
            setDisplayedConversations,
            displayedPictures,
            setDisplayedPictures,
            compose,
            setCompose: composeOff,
            selectedElement: selectedElement,
            setSelectedElement: setSelectedElement,
            showsearchField,
            setShowsearchField,
            searchFieldRef,
            conversationRef,
          }}
        >
          <RouterProvider
            router={!!token && !!userId ? loggedInRouter : router}
          />
        </NavContext.Provider>
      </UserContext.Provider>
    </SocketContext.Provider>
  );
};

export default App;
