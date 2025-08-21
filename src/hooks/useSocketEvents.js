import { useCallback } from 'react';

/**
 * Custom hook to handle socket events
 * @param {Object} socket - Socket.IO instance
 * @param {Object} state - State objects and setters
 * @returns {Object} - Socket event handlers
 */
export const useSocketEvents = (socket, state) => {
  const {
    setRequests,
    setRequestCount,
    selectedConversationRef,
    setDisplayedConversations,
    setChatCache,
    setActiveContacts,
    setUsersTyping,
    typingTimeoutsRef,
    markConversationAsRead
  } = state;

  /**
   * Handle new request event
   */
  const handleNewRequest = useCallback((request) => {
    console.log("RECEIVED NEW REQUEST", request);
    setRequests((prev) => {
      const requestMap = new Map(prev);
      requestMap.set(request._id, request);

      const sortedRequests = new Map(
        [...requestMap.entries()].sort((a, b) => {
          return new Date(b[1].updatedAt) - new Date(a[1].updatedAt);
        })
      );

      sessionStorage.setItem(
        "requests",
        JSON.stringify(Array.from(sortedRequests.entries()))
      );

      return sortedRequests;
    });
  }, [setRequests]);

  /**
   * Handle remove from requests event
   */
  const handleRemoveFromRequests = useCallback((convoID) => {
    setRequests((prev) => {
      const requestMap = new Map(prev);
      requestMap.delete(convoID);
      sessionStorage.setItem(
        "requests",
        JSON.stringify(Array.from(requestMap.entries()))
      );
      return requestMap;
    });
    setRequestCount((prev) => {
      const count = prev - 1;
      sessionStorage.setItem("requestCount", count);
      return count;
    });
  }, [setRequests, setRequestCount]);

  /**
   * Handle conversation header update
   */
  const handleUpdateConversationHeader = useCallback((convo) => {
    if (convo.convoReceiver._id === selectedConversationRef.current) {
      markConversationAsRead(convo.convoReceiver._id);
      convo.convoReceiver.read = true;
    }

    setDisplayedConversations((prev) => {
      const newMap = new Map(prev);
      newMap.set(convo.convoReceiver._id, convo.convoReceiver);
      const newMapSorted = new Map(
        [...newMap.entries()].sort(
          (a, b) =>
            new Date(b[1].updatedAt).getTime() -
            new Date(a[1].updatedAt).getTime()
        )
      );

      sessionStorage.setItem(
        "displayedConversations",
        JSON.stringify(Array.from(newMapSorted.entries()))
      );
      return newMapSorted;
    });

    setChatCache((prev) => {
      const newChatCache = new Map(prev);
      const oldMessages = newChatCache.get(convo.convoReceiver._id);
      const newMessages = [
        {
          _id: convo.convoReceiver.lastMessage._id,
          content: convo.convoReceiver.lastMessage.content,
          sender: convo.convoReceiver.userId,
          timestamp: convo.convoReceiver.updatedAt,
        },
        ...oldMessages,
      ];
      newChatCache.set(convo.convoReceiver._id, newMessages);

      sessionStorage.setItem(
        "chatCache",
        JSON.stringify(Array.from(newChatCache.entries()))
      );

      return newChatCache;
    });
  }, [setDisplayedConversations, setChatCache, selectedConversationRef, markConversationAsRead]);

  /**
   * Handle user offline event
   */
  const handleUserOffline = useCallback((data) => {
    setActiveContacts((prev) => {
      let activeContactsMap = new Map(prev.map((c) => [c.userId, c]));
      activeContactsMap.delete(data);
      return Array.from(activeContactsMap.values());
    });
  }, [setActiveContacts]);

  /**
   * Handle user online event
   */
  const handleUserOnline = useCallback((data) => {
    setActiveContacts((prev) => {
      let activeContactsMap = new Map(prev.map((c) => [c.userId, c]));
      activeContactsMap.set(data.userId, data);
      return Array.from(activeContactsMap.values());
    });
  }, [setActiveContacts]);

  /**
   * Handle user typing event
   */
  const handleUserTyping = useCallback((typingInfo) => {
    console.log("USER TYPING", typingInfo);
    if (typingInfo.isTyping) {
      setUsersTyping((prev) => {
        const usersTypingSet = new Set(prev);
        usersTypingSet.add(typingInfo.convoId);
        return usersTypingSet;
      });

      if (typingTimeoutsRef.current.has(typingInfo.convoId)) {
        clearTimeout(typingTimeoutsRef.current.get(typingInfo.convoId));
      }
    } else {
      const timeout = setTimeout(() => {
        setUsersTyping((prev) => {
          const typingMap = new Set(prev);
          typingMap.delete(typingInfo.convoId);
          return typingMap;
        });
        typingTimeoutsRef.current.delete(typingInfo.convoId);
      }, 2000);

      typingTimeoutsRef.current.set(typingInfo.convoId, timeout);
    }
  }, [setUsersTyping, typingTimeoutsRef]);

  /**
   * Handle restored typing event
   */
  const handleRestoredTyping = useCallback((convos) => {
    console.log("RESTORED TYPING", convos);
    setUsersTyping((prev) => {
      const typingMap = new Set(prev);
      convos.forEach((convoId) => {
        typingMap.add(convoId);
      });
      return typingMap;
    });
  }, [setUsersTyping]);

  /**
   * Setup socket event listeners
   */
  const setupSocketEvents = useCallback(() => {
    if (!socket) return;

    socket.on("newRequest", handleNewRequest);
    socket.on("removeFromRequests", handleRemoveFromRequests);
    socket.on("updateConversationHeader", handleUpdateConversationHeader);
    socket.on("userOffline", handleUserOffline);
    socket.on("userOnline", handleUserOnline);
    socket.on("userTyping", handleUserTyping);
    socket.on("restoredTyping", handleRestoredTyping);

    return () => {
      socket.off("newRequest");
      socket.off("removeFromRequests");
      socket.off("updateConversationHeader");
      socket.off("userOffline");
      socket.off("userOnline");
      socket.off("userTyping");
      socket.off("restoredTyping");
    };
  }, [
    socket,
    handleNewRequest,
    handleRemoveFromRequests,
    handleUpdateConversationHeader,
    handleUserOffline,
    handleUserOnline,
    handleUserTyping,
    handleRestoredTyping
  ]);

  return {
    setupSocketEvents
  };
}; 