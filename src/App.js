import "./App.css";
import Contacts from "./Layout/Contacts.jsx";
import Chat from "./Layout/Chat.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./Layout/Root.jsx";
import Requests from "./Layout/Requests.jsx";
import Archived from "./Layout/Archived.jsx";

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
  return <RouterProvider router={router} />;
};

export default App;
