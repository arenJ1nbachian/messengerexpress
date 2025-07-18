export const handleNavButtonChange = (
  destination,
  navigate,
  composeContext,
  convoContext,
  requestContext
) => {
  if (destination === "chats") {
    navigate(`chats`);
  } else if (destination === "people") {
    switch (composeContext.compose) {
      case true:
        navigate(`people/none`);
        composeContext.setCompose(false);
        sessionStorage.removeItem("compose");
        break;
      case false:
        if (convoContext.selectedConversation) {
          navigate(`/people/${convoContext.selectedConversation}`);
        } else if (requestContext.selectedRequest) {
          navigate(`/people/${requestContext.selectedRequest}`);
        } else {
          navigate(`/people/none`);
        }
        break;
      default:
        break;
    }
  } else if (destination === "requests") {
    switch (composeContext.compose) {
      case true:
        navigate(`requests/none`);
        composeContext.setCompose(false);
        sessionStorage.removeItem("compose");
        break;
      case false:
        if (convoContext.selectedConversation) {
          navigate(`/requests/${convoContext.selectedConversation}`);
        } else if (requestContext.selectedRequest) {
          navigate(`/requests/${requestContext.selectedRequest}`);
        } else {
          navigate(`/requests/none`);
        }
        break;
      default:
        break;
    }
  } else if (destination === "archived") {
    switch (composeContext.compose) {
      case true:
        navigate(`archived/none`);
        composeContext.setCompose(false);
        sessionStorage.removeItem("compose");
        break;
      case false:
        if (convoContext.selectedConversation) {
          navigate(`/archived/${convoContext.selectedConversation}`);
        } else if (requestContext.selectedRequest) {
          navigate(`/archived/${requestContext.selectedRequest}`);
        } else {
          navigate(`/archived/none`);
        }
        break;
      default:
        break;
    }
  }
};
