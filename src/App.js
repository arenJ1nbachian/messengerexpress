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
      { path: "/", element: <Navigate to="/chats" replace /> },
      {
        path: "people",
        element: <Contacts />,
        children: [{ path: ":id", element: null }],
      },
      {
        path: "requests",
        element: <Requests />,
        children: [{ path: ":id", element: null }],
      },
      {
        path: "archived",
        element: <Archived />,
        children: [{ path: ":id", element: null }],
      },
      {
        path: "chats",
        element: <Chat />,
        children: [
          { path: ":id", element: null },
          { path: "compose", element: null },
          { path: "none", element: null },
        ],
      },
    ],
  },
]);

/**
 * The main App component
 * @returns {JSX.Element}
 */
const App = () => {
  /**
   * The state to keep track of whether the nav is expanded or not
   */
  const [navExpanded, setNavExpanded] = useState(
    JSON.parse(sessionStorage.getItem("navExpanded")) || false
  );

  const convoOverride = useRef({ status: false, _id: "" });

  const displayedConversationsRef = useRef(null);

  /**
   * The state to keep track of which item is hovered
   */
  const [hovered, setHovered] = useState(-1);

  /**
   * The state to keep track of whether the settings are shown or not
   */
  const [showSettings, setShowSettings] = useState(false);

  /**
   * The ref to the settings container
   */
  const settingsRef = useRef(null);

  /**
   * The state to keep track of which chat is selected
   */
  const [selected, setSelected] = useState(
    JSON.parse(sessionStorage.getItem("selected")) || 0
  );

  /**
   * The ref to the conversation container
   */
  const conversationRef = useRef(null);

  /**
   * The state to keep track of which chat is currently being displayed
   */
  const [selectedChat, setSelectedChat] = useState(
    JSON.parse(sessionStorage.getItem("selectedChat")) || 0
  );

  const selectedChatDetails = useRef(
    JSON.parse(sessionStorage.getItem("selectedChatDetails")) || null
  );

  const composedMessage = useRef(false);

  /**
   * The state to keep track of the conversations that are displayed
   */
  const [displayedConversations, setDisplayedConversations] = useState([]);

  /**
   * The state to keep track of the pictures that are displayed
   */
  const [displayedPictures, setDisplayedPictures] = useState(
    sessionStorage.getItem("displayedPictures") || []
  );

  /**
   * The state to keep track of the token and user ID
   */
  const [token, setToken] = useState(sessionStorage.getItem("token") || false);
  const [userId, setUserId] = useState(
    sessionStorage.getItem("userId") || false
  );

  /**
   * The state to keep track of whether the compose button is shown or not
   */
  const [compose, setCompose] = useState(false);

  const [requests, setRequests] = useState([]);

  const [requestCount, setRequestCount] = useState(0);

  const [selectedRequest, setSelectedRequest] = useState(null);

  /**
   * The state to keep track of which element is selected
   */
  const [selectedElement, setSelectedElement] = useState(null);

  /**
   * The state to keep track of whether the search field is shown or not
   */
  const [showsearchField, setShowsearchField] = useState(true);

  /**
   * The ref to the search field container
   */
  const searchFieldRef = useRef(null);

  /**
   * The state to keep track of the socket
   */
  const [socket, setSocket] = useState(null);

  /**
   * The effect to set the socket when the user logs in
   */
  useEffect(() => {
    if ((token, userId)) {
      setSocket(
        io("http://localhost:5000", {
          query: { uid: userId },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
      );
    }
  }, [userId, token]);

  /**
   * The callback to turn the compose button on or off
   * @param {boolean} bool - whether the compose button should be on or off
   * @param {number} convoID - the ID of the conversation
   */
  const composeOff = useCallback((bool, convoID) => {
    if (!bool) {
      setCompose(false);
      setSelectedElement(null);
    } else {
      setCompose(true);
    }
  }, []);

  /**
   * The callback to log the user in
   * @param {string} uid - the user ID
   * @param {string} token - the token
   */
  const login = useCallback((uid, token) => {
    setToken(token);
    setUserId(uid);
  }, []);

  /**
   * The callback to log the user out
   */
  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setSelected(0);
    setSelectedChat(0);
    setSelectedElement(null);
    setNavExpanded(false);
    sessionStorage.clear();
    selectedChatDetails.current = null;
    setCompose(false);
    setRequests([]);
    setRequestCount(null);
  }, []);

  /**
   * The effect to clear the selected chat when it is changed
   */
  useEffect(() => {
    console.log("SELECTED CHAT HAS BEEN CHANGED", selectedChat);
    if (selectedChat !== 0 && displayedConversations.length > 0) {
      selectedChatDetails.current = displayedConversations[selectedChat - 1];
      sessionStorage.setItem(
        "selectedChatDetails",
        JSON.stringify(selectedChatDetails.current)
      );
    }
  }, [selectedChat, displayedConversations]);

  /**
   * The callback to handle the nav expand button being clicked
   * @param {boolean} value - whether the nav should be expanded or not
   */
  const handleNavExpand = useCallback((value) => {
    setNavExpanded(value);
    sessionStorage.setItem("navExpanded", value);
  }, []);

  /**
   * The callback to handle the selected chat being changed
   * @param {number} value - the ID of the new selected chat
   */
  const handleSelected = useCallback((value) => {
    setSelected(value);
    sessionStorage.setItem("selected", value);
  }, []);

  /**
   * The callback to handle the hovered item being changed
   * @param {number} value - the ID of the new hovered item
   */
  const handleHovered = useCallback((value) => {
    setHovered(value);
  }, []);

  /**
   * The callback to handle the settings button being clicked
   * @param {boolean} value - whether the settings should be shown or not
   */
  const handleShowSettings = useCallback((value) => {
    setShowSettings(value);
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
            displayedConversations,
            setDisplayedConversations,
            displayedPictures,
            compose,
            setCompose: composeOff,
            selectedElement: selectedElement,
            setSelectedElement: setSelectedElement,
            showsearchField,
            setShowsearchField,
            searchFieldRef,
            conversationRef,
            selectedChatDetails,
            composedMessage,
            convoOverride,
            displayedConversationsRef,
            requests,
            setRequests,
            requestCount,
            setRequestCount,
            selectedRequest,
            setSelectedRequest,
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
