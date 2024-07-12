import "./App.css";
import NavBar from "./Components/NavBar.jsx";
import Contacts from "./Layout/Contacts.jsx";
import Chat from "./Layout/Chat.jsx";

const App = () => {
  return (
    <>
      <NavBar />
      <Contacts />
      <Chat />
    </>
  );
};

export default App;
