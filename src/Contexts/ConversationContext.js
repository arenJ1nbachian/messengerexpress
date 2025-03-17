import { createContext } from "react";
export const ConversationContext = createContext({
  selectedConversation: null,
  setSelectedConversation: () => {},
  selectedConversationRef: null,
  displayedConversations: null,
  setDisplayedConversations: null,
  displayedConversationsRef: null,
  isConvosFullyLoaded: false,
});
