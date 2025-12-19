const REACT_APP_API_BASE = process.env.REACT_APP_API_BASE;
export const handleRequestChoice = async (choice, convoId) => {
  try {
    console.log(convoId);
    const res = await fetch(
      `${REACT_APP_API_BASE}/api/conversations/${choice}Request`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ convoId }),
      }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error handling request choice:", error);
  }
};
