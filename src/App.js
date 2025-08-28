import "./App.css";
import Contacts from "./Layout/Contacts.jsx";
import Chat from "./Layout/Chat.jsx";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Root from "./Layout/Root.jsx";
import Requests from "./Layout/Requests.jsx";
import Archived from "./Layout/Archived.jsx";
import { NavContext } from "./Contexts/NavContext.js";
import { useCallback, useEffect, useRef, useState } from "react";
import Login from "./Layout/Login&Register.jsx";
import { UserContext } from "./Contexts/UserContext.js";
import { SocketContext } from "./Contexts/SocketContext.js";
import io from "socket.io-client";
import { markConversationAsRead } from "./utils/markConversationAsRead.js";
import { logOff } from "./utils/logOff.js";
import { ConversationContext } from "./Contexts/ConversationContext.js";
import { ComposeContext } from "./Contexts/ComposeContext.js";
import { RequestContext } from "./Contexts/RequestContext.js";
import { ChatCacheContext } from "./Contexts/ChatCacheContext.js";
import { ActiveUsersContext } from "./Contexts/ActiveUsersContext.js";
import { UserTypingContext } from "./Contexts/UserTypingContext.js";

const API = process.env.REACT_APP_API_BASE;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      { path: "/", element: <Navigate to="/login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Login /> },
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

  const [name, setName] = useState(sessionStorage.getItem("name") || null);

  const [profilePicture, setProfilePicture] = useState(
    sessionStorage.getItem("profilePicture") || null
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
    sessionStorage.getItem("selectedConversation")
  );

  const selectedConversationRef = useRef(
    sessionStorage.getItem("selectedConversation")
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
  const [compose, setCompose] = useState(
    sessionStorage.getItem("compose") === "true" || false
  );

  const [inputDraft, setInputDraft] = useState("");

  const [requests, setRequests] = useState(
    sessionStorage.getItem("requests")
      ? new Map(JSON.parse(sessionStorage.getItem("requests")))
      : new Map()
  );

  const [requestCount, setRequestCount] = useState(
    JSON.parse(sessionStorage.getItem("requestCount")) || 0
  );

  const [selectedRequest, setSelectedRequest] = useState(
    sessionStorage.getItem("selectedRequest") || null
  );

  const selectedRequestRef = useRef(
    sessionStorage.getItem("selectedRequest") || null
  );

  const chatContainerRef = useRef(null);

  const mainRef = useRef(null);

  const [chatCache, setChatCache] = useState(
    sessionStorage
      ? new Map(JSON.parse(sessionStorage.getItem("chatCache")))
      : new Map()
  );

  const isConvosFullyLoaded = useRef(false);

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
  const socket = useRef();

  useEffect(() => {
    if (socket.current) {
      socket.current.on("newRequest", (request) => {
        console.log("RECEIVED NEW REQUEST", request);
        setRequests((prev) => {
          const requestMap = new Map(prev);
          requestMap.set(request._id, request);

          const sortedRequests = new Map(
            [...requestMap.entries()].sort((a, b) => {
              return new Date(b[1].updatedAt) - new Date(a[1].updatedAt);
            })
          );

          sessionStorage.setItem(
            "requests",
            JSON.stringify(Array.from(sortedRequests.entries()))
          );

          return sortedRequests;
        });
        setRequestCount((prev) => {
          const count = prev + 1;
          sessionStorage.setItem("requestCount", count);
          return count;
        });
      });
      socket.current.on("removeFromRequests", (convoID) => {
        setRequests((prev) => {
          const requestMap = new Map(prev);
          requestMap.delete(convoID);
          sessionStorage.setItem(
            "requests",
            JSON.stringify(Array.from(requestMap.entries()))
          );
          return requestMap;
        });
        setRequestCount((prev) => {
          const count = prev - 1;
          sessionStorage.setItem("requestCount", count);
          return count;
        });
      });
      socket.current.on("updateConversationHeader", (convo) => {
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

        setChatCache((prev) => {
          const newChatCache = new Map(prev);
          const oldMessages = newChatCache.get(convo.convoReceiver._id);
          const newMessages = [
            {
              _id: convo.convoReceiver.lastMessage._id,
              content: convo.convoReceiver.lastMessage.content,
              sender: convo.convoReceiver.userId,
              timestamp: convo.convoReceiver.updatedAt,
            },
            ...oldMessages,
          ];
          newChatCache.set(convo.convoReceiver._id, newMessages);

          sessionStorage.setItem(
            "chatCache",
            JSON.stringify(Array.from(newChatCache.entries()))
          );

          return newChatCache;
        });
      });
      socket.current.on("userOffline", (data) => {
        setActiveContacts((prev) => {
          let activeContactsMap = new Map(prev.map((c) => [c.userId, c]));
          activeContactsMap.delete(data);
          return Array.from(activeContactsMap.values());
        });
      });
      socket.current.on("userOnline", (data) => {
        setActiveContacts((prev) => {
          let activeContactsMap = new Map(prev.map((c) => [c.userId, c]));
          activeContactsMap.set(data.userId, data);
          return Array.from(activeContactsMap.values());
        });
      });
      socket.current.on("userTyping", (typingInfo) => {
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
      socket.current.on("restoredTyping", (convos) => {
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
      if (socket.current) {
        socket.current.off("newRequest");
        socket.current.off("updateConversationHeader");
        socket.current.off("userOffline");
        socket.current.off("userOnline");
        socket.current.off("userTyping");
        socket.current.off("restoredTyping");
      }
    };
  }, [socket]);

  /**
   * The effect to set the socket when the user logs in
   */
  useEffect(() => {
    if (token && userId) {
      socket.current = io(API, {
        query: { uid: userId },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
  }, [userId, token]);

  useEffect(() => {
    if (token && userId) {
      document.getElementById("root").style.padding = "16px";
    } else {
      document.getElementById("root").style.padding = "0px";
    }
  }, [token, userId]);

  useEffect(() => {
    if (
      userId &&
      token &&
      navExpanded &&
      window.innerWidth <= 1200 &&
      chatContainerRef.current.style.display !== "none"
    ) {
      chatContainerRef.current.style.display = "none";
      mainRef.current.style.flex = "1";
    } else if (
      userId &&
      token &&
      !navExpanded &&
      window.innerWidth <= 1200 &&
      chatContainerRef.current.style.display !== "flex"
    ) {
      chatContainerRef.current.style.display = "flex";
    }
    const handleResize = () => {
      if (
        userId &&
        token &&
        window.innerWidth <= 1200 &&
        navExpanded &&
        (chatContainerRef.current.style.display === "flex" ||
          chatContainerRef.current.style.display === "")
      ) {
        console.log("SMALL SCREEN");
        setNavExpanded(false);
        sessionStorage.setItem("navExpanded", false);
      } else if (
        userId &&
        token &&
        window.innerWidth > 1200 &&
        navExpanded &&
        chatContainerRef.current.style.display === "none"
      ) {
        chatContainerRef.current.style.display = "flex";
        mainRef.current.style.flex = "unset";
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [navExpanded, selectedConversation]);

  /**
   * The callback to turn the compose button on or off
   * @param {boolean} bool - whether the compose button should be on or off
   * @param {number} convoID - the ID of the conversation
   */
  const composeOff = useCallback((bool, convoID) => {
    if (!bool) {
      setCompose(false);
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
    console.log("TESTING");
    console.log(socket);
    logOff(
      setToken,
      setUserId,
      setSelected,
      setSelectedConversation,
      setSelectedRequest,
      setSelectedElement,
      setNavExpanded,
      setCompose,
      setRequests,
      setRequestCount,
      isConvosFullyLoaded,
      setDisplayedConversations,
      selectedConversationRef,
      socket.current
    );
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
    <SocketContext.Provider value={{ socket }}>
      <UserContext.Provider
        value={{
          isLoggedIn: !!token,
          token,
          userId,
          login,
          logout,
          name,
          setName,
          profilePicture,
          setProfilePicture,
        }}
      >
        <NavContext.Provider
          value={{
            chatContainerRef,
            mainRef,
            navExpanded: navExpanded,
            setNavExpanded: handleNavExpand,
            selected,
            setSelected: handleSelected,
            hovered,
            setHovered: handleHovered,
            showSettings,
            setShowSettings: handleShowSettings,
            settingsRef,
          }}
        >
          <ComposeContext.Provider
            value={{
              compose,
              setCompose: composeOff,
              selectedElement,
              setSelectedElement,
              showsearchField,
              setShowsearchField,
              searchFieldRef,
              inputDraft,
              setInputDraft,
            }}
          >
            <ConversationContext.Provider
              value={{
                selectedConversation,
                setSelectedConversation,
                selectedConversationRef,
                displayedConversations,
                displayedConversationsRef,
                setDisplayedConversations,
                isConvosFullyLoaded,
              }}
            >
              <UserTypingContext.Provider
                value={{ usersTyping, setUsersTyping }}
              >
                <RequestContext.Provider
                  value={{
                    requests,
                    setRequests,
                    requestCount,
                    setRequestCount,
                    selectedRequest,
                    setSelectedRequest,
                    selectedRequestRef,
                  }}
                >
                  <ActiveUsersContext.Provider
                    value={{ activeContacts, setActiveContacts }}
                  >
                    <ChatCacheContext.Provider
                      value={{ chatCache, setChatCache }}
                    >
                      <RouterProvider
                        router={!!token && !!userId ? loggedInRouter : router}
                      />
                    </ChatCacheContext.Provider>
                  </ActiveUsersContext.Provider>
                </RequestContext.Provider>
              </UserTypingContext.Provider>
            </ConversationContext.Provider>
          </ComposeContext.Provider>
        </NavContext.Provider>
      </UserContext.Provider>
    </SocketContext.Provider>
  );
};

export default App;
