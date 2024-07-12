import "./App.css";
import Contacts from "./Layout/Contacts.jsx";
import Chat from "./Layout/Chat.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./Layout/Root.jsx";
import Requests from "./Layout/Requests.jsx";
import Archived from "./Layout/Archived.jsx";
import { NavContext } from "./Contexts/NavContext.js";
import { useCallback, useRef, useState } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "chats", element: <Chat /> },
      { path: "people", element: <Contacts /> },
      { path: "requests", element: <Requests /> },
      { path: "archived", element: <Archived /> },
    ],
  },
]);

const App = () => {
  const [navExpanded, setNavExpanded] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [hovered, setHovered] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  const handleNavExpand = useCallback((value) => {
    setNavExpanded(value);
  }, []);

  const handleSelected = useCallback((value) => {
    setSelected(value);
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
