import { createContext } from "react";

export const UserContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  name: null,
  setName: () => {},
  profilePicture: null,
  setProfilePicture: () => {},
  login: () => {},
  logout: () => {},
});
