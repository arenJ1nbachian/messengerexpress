import { createContext } from "react";

export const ChatCacheContext = createContext({
  chatCache: null,
  setChatCache: null,
});
