import { createContext } from "react";

export const UserTypingContext = createContext({
  usersTyping: null,
  setUsersTyping: null,
});
