import { markConversationAsRead } from "./markConversationAsRead";

export const updateMessageRead = async (convoContext, id) => {
  await markConversationAsRead(id);
  convoContext.setDisplayedConversations((prev) => {
    const updatedConversations = new Map(prev);
    updatedConversations.get(id).read = true;
    sessionStorage.setItem(
      "displayedConversations",
      JSON.stringify(Array.from(updatedConversations.entries()))
    );
    return updatedConversations;
  });
};
