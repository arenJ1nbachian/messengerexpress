export const logOff = (
  setToken,
  setUserId,
  setSelected,
  setSelectedConversation,
  setSelectedRequest,
  setSelectedElement,
  setNavExpanded,
  setCompose,
  setRequests,
  setRequestCount,
  isConvosFullyLoaded,
  setDisplayedConversations,
  selectedConversationRef,
  socket
) => {
  socket.removeAllListeners();
  socket.close();
  setToken(null);
  setUserId(null);
  setSelected(0);
  setSelectedConversation(null);
  setSelectedRequest(null);
  setSelectedElement(null);
  setNavExpanded(false);
  sessionStorage.clear();
  localStorage.clear();
  setCompose(false);
  setRequests([]);
  setRequestCount(0);
  isConvosFullyLoaded.current = false;
  setDisplayedConversations([]);
  selectedConversationRef.current = null;
};
