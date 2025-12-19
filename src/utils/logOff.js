export const logOff = (
  setChatCache,
  setShowSettings,
  setProfilePicture,
  setName,
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
  setProfilePicture(null);
  setName(null);
  setToken(null);
  setUserId(null);
  setSelected(0);
  setSelectedConversation(null);
  setSelectedRequest(null);
  setSelectedElement(null);
  setNavExpanded(false);
  setShowSettings(false);
  setChatCache(new Map());
  sessionStorage.clear();
  localStorage.clear();
  setCompose(false);
  setRequests([]);
  setRequestCount(0);
  isConvosFullyLoaded.current = false;
  setDisplayedConversations([]);
  selectedConversationRef.current = null;
};
