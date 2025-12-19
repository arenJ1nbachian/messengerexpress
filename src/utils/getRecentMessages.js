const REACT_APP_API_BASE = process.env.REACT_APP_API_BASE;
export const getRecentMessages = async (chatCacheContext, convoContext) => {
  try {
    const response = await fetch(
      `${REACT_APP_API_BASE}/api/conversations/getRecentMessages/${convoContext.selectedConversation}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    const data = await response.json();

    chatCacheContext.setChatCache((prevCache) => {
      const newCache = new Map(prevCache);
      newCache.set(convoContext.selectedConversationRef.current, data);

      if (newCache.size > 10) {
        const oldestKey = newCache.keys().next().value;
        newCache.delete(oldestKey);
      }

      const cacheArray = Array.from(newCache.entries());
      sessionStorage.setItem("chatCache", JSON.stringify(cacheArray));

      return newCache;
    });
  } catch (err) {
    console.log(err);
  }
};
