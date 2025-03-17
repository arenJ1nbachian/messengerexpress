import { createContext } from "react";

export const ActiveUsersContext = createContext({
  activeContacts: null,
  setActiveContacts: null,
});
