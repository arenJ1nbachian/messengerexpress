import { getRecentMessages } from "./getRecentMessages";
import { updateMessageRead } from "./updateMessageRead";

/*  This function handles the change of the selected conversation. A selected conversation may change from switching
    between conversations or composing a message. The edge case only occurs when the user navigates out of the chats page
    while composing a message, the code explicitly changes the state of compose and selectedConversation to falsey values
    when switching out of the chats page. When that happens, the first conversation is selected upon re-entering the chats page.
    Upon mounting the Chats page, this method is called, the user might have a request open, in which case the code navigates to
    the chats page with the request open and the id of the request in the url.
*/
export const handleConversationChange = async (
  chatCacheContext,
  convoContext,
  composeContext,
  navigate,
  requestContext
) => {
  // If the newly selected conversation is a valid conversation
  if (convoContext.selectedConversation) {
    // If the user had a request open, remove it
    if (requestContext.selectedRequest) {
      sessionStorage.removeItem("selectedRequest");
      requestContext.selectedRequestRef.current = null;
      requestContext.setSelectedRequest(null);
    }

    // Update the selected conversationRef and session storage
    convoContext.selectedConversationRef.current =
      convoContext.selectedConversation;
    sessionStorage.setItem(
      "selectedConversation",
      convoContext.selectedConversation
    );

    // Navigate to the appropriate route
    navigate(`/chats/${convoContext.selectedConversation}`);
    sessionStorage.removeItem("compose");
    if (
      !convoContext.displayedConversations.get(
        convoContext.selectedConversation
      ).read
    ) {
      updateMessageRead(convoContext, convoContext.selectedConversation);
    }

    // Get the recent messages for the selected conversation only if it's not yet cached
    if (!chatCacheContext.chatCache.has(convoContext.selectedConversation)) {
      getRecentMessages(chatCacheContext, convoContext);
    }
  }
  // If the user is composing a message
  else if (composeContext.compose) {
    // If the user had a request open, remove it
    if (requestContext.selectedRequest) {
      sessionStorage.removeItem("selectedRequest");
      requestContext.selectedRequestRef.current = null;
      requestContext.setSelectedRequest(null);
    }
    navigate("/chats/compose");
    sessionStorage.setItem("compose", true);
  } else if (requestContext.selectedRequest) {
    navigate(`/chats/${requestContext.selectedRequest}`);
  }
  // Edge case
  else if (convoContext.displayedConversations.size > 0) {
    const firstConversation = convoContext.displayedConversations
      .keys()
      .next().value;
    navigate(`/chats/${firstConversation}`);
    sessionStorage.setItem("selectedConversation", firstConversation);
    convoContext.selectedConversationRef.current = firstConversation;
    convoContext.setSelectedConversation(firstConversation);
  }
  // If the user has not conversated with anyone
  else {
    navigate("/chats/none");
  }
};
