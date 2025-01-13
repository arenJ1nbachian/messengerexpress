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
import { markConversationAsRead } from "./utils/markConversationAsRead.js";

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

  const [selectedConversation, setSelectedConversation] = useState(
    sessionStorage.getItem("selectedConversation") || null
  );

  const selectedConversationRef = useRef(
    sessionStorage.getItem("selectedConversation") || null
  );

  /**
   * The state to keep track of the conversations that are displayed
   */
  const [displayedConversations, setDisplayedConversations] = useState(
    sessionStorage.getItem("displayedConversations")
      ? new Map(JSON.parse(sessionStorage.getItem("displayedConversations")))
      : new Map()
  );

  const typingTimeoutsRef = useRef(new Map());

  const [usersTyping, setUsersTyping] = useState(
    sessionStorage.getItem("usersTyping")
      ? new Set(JSON.parse(sessionStorage.getItem("usersTyping")))
      : new Set()
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

  const [requests, setRequests] = useState(
    sessionStorage.getItem("requests")
      ? new Map(JSON.parse(sessionStorage.getItem("requests")))
      : new Map()
  );

  const [requestCount, setRequestCount] = useState(0);

  const [selectedRequest, setSelectedRequest] = useState(
    sessionStorage.getItem("selectedRequest") || null
  );

  const [isConvosFullyLoaded, setIsConvosFullyLoaded] = useState(false);

  const [isOnlineUsersFullyLoaded, setIsOnlineUsersFullyLoaded] =
    useState(false);

  const [activeContacts, setActiveContacts] = useState(
    sessionStorage.getItem("activeContacts")
      ? JSON.parse(sessionStorage.getItem("activeContacts"))
      : []
  );

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

  useEffect(() => {
    if (socket) {
      socket.on("newRequest", (request) => {
        console.log("RECEIVED NEW REQUEST", request);
        setRequests((prev) => {
          const requestMap = new Map(prev);
          requestMap.set(request._id, request);

          const sortedRequests = new Map(
            [...requestMap.entries()].sort((a, b) => {
              return new Date(b[1].updatedAt) - new Date(a[1].updatedAt);
            })
          );

          return sortedRequests;
        });
      });
      socket.on("removeFromRequests", (convoID) => {
        setRequests((prev) => {
          const requestMap = new Map(prev);
          requestMap.delete(convoID);
          return requestMap;
        });
        setRequestCount((prev) => prev - 1);
      });
      socket.on("updateConversationHeader", (convo) => {
        if (convo.convoReceiver._id === selectedConversationRef.current) {
          markConversationAsRead(convo.convoReceiver._id);
          convo.convoReceiver.read = true;
        }

        setDisplayedConversations((prev) => {
          const newMap = new Map(prev);
          newMap.set(convo.convoReceiver._id, convo.convoReceiver);
          const newMapSorted = new Map(
            [...newMap.entries()].sort(
              (a, b) =>
                new Date(b[1].updatedAt).getTime() -
                new Date(a[1].updatedAt).getTime()
            )
          );
          sessionStorage.setItem(
            "displayedConversations",
            JSON.stringify(Array.from(newMapSorted.entries()))
          );
          return newMapSorted;
        });
      });
      socket.on("userOffline", (data) => {
        setActiveContacts((prev) => {
          let activeContactsMap = new Map(prev.map((c) => [c.userId, c]));
          activeContactsMap.delete(data);
          return Array.from(activeContactsMap.values());
        });
      });
      socket.on("userOnline", (data) => {
        setActiveContacts((prev) => {
          let activeContactsMap = new Map(prev.map((c) => [c.userId, c]));
          activeContactsMap.set(data.userId, data);
          return Array.from(activeContactsMap.values());
        });
      });
      socket.on("userTyping", (typingInfo) => {
        console.log("USER TYPING", typingInfo);
        if (typingInfo.isTyping) {
          setUsersTyping((prev) => {
            const usersTypingSet = new Set(prev);
            usersTypingSet.add(typingInfo.convoId);

            return usersTypingSet;
          });

          if (typingTimeoutsRef.current.has(typingInfo.convoId)) {
            clearTimeout(typingTimeoutsRef.current.get(typingInfo.convoId));
          }
        } else {
          const timeout = setTimeout(() => {
            setUsersTyping((prev) => {
              const typingMap = new Set(prev);
              typingMap.delete(typingInfo.convoId);

              return typingMap;
            });
            typingTimeoutsRef.current.delete(typingInfo.convoId);
          }, 2000);

          typingTimeoutsRef.current.set(typingInfo.convoId, timeout);
        }
      });
      socket.on("restoredTyping", (convos) => {
        console.log("RESTORED TYPING", convos);
        setUsersTyping((prev) => {
          const typingMap = new Set(prev);
          convos.forEach((convoId) => {
            typingMap.add(convoId);
          });
          return typingMap;
        });
      });
    }

    return () => {
      if (socket) {
        socket.off("newRequest");
        socket.off("updateConversationHeader");
        socket.off("userOffline");
        socket.off("userOnline");
        socket.off("userTyping");
        socket.off("restoredTyping");
      }
    };
  }, [socket]);

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
    setSelectedConversation(null);
    setSelectedRequest(null);
    setSelectedElement(null);
    setNavExpanded(false);
    sessionStorage.clear();
    setCompose(false);
    setRequests([]);
    setRequestCount(0);
    setIsConvosFullyLoaded(false);
    setDisplayedConversations([]);
  }, []);

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
            displayedConversations,
            setDisplayedConversations,
            compose,
            setCompose: composeOff,
            selectedElement: selectedElement,
            setSelectedElement: setSelectedElement,
            showsearchField,
            setShowsearchField,
            searchFieldRef,
            requests,
            setRequests,
            requestCount,
            setRequestCount,
            selectedRequest,
            setSelectedRequest,
            isConvosFullyLoaded,
            setIsConvosFullyLoaded,
            activeContacts,
            setActiveContacts,
            selectedConversation,
            setSelectedConversation,
            selectedConversationRef,
            usersTyping,
            setUsersTyping,
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
