import { createContext } from "react";

export const NavContext = createContext({
  navExpanded: false,
  setNavExpanded: () => {},
  selected: -1,
  setSelected: () => {},
  hovered: -1,
  setHovered: () => {},
  showSettings: false,
  setShowSettings: () => {},
  settingsRef: null,
  selectedChat: -1,
  setSelectedChat: () => {},
  selectChatDetails: {},
  setSelectChatDetails: () => {},
  displayedConversations: null,
  setDisplayedConversations: () => {},
});
