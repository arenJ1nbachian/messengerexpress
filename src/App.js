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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "/", element: <Navigate to="/chats" replace /> },
      { path: "chats", element: <Chat /> },
      { path: "people", element: <Contacts /> },
      { path: "requests", element: <Requests /> },
      { path: "archived", element: <Archived /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
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

  return (
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
      }}
    >
      <RouterProvider router={router} />
    </NavContext.Provider>
  );
};

export default App;
