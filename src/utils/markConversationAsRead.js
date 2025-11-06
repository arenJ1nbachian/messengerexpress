export const markConversationAsRead = async (convoID) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE}/api/conversations/convoRead`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ convoID }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to mark conversation as read");
    }

    return await res.json();
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};
