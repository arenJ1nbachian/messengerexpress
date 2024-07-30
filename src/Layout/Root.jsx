import { Outlet } from "react-router-dom";
import "./Root.css";
import NavBar from "../Components/NavBar";

const Root = () => {
  return (
    <>
      {/* <NavBar />*/}
      <main className="main">
        <Outlet />
      </main>
    </>
  );
};

export default Root;
