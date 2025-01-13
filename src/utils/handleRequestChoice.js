export const handleRequestChoice = async (choice, convoId) => {
  try {
    console.log(convoId);
    const res = await fetch(
      `http://localhost:5000/api/conversations/${choice}Request`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
