/* 
    This method is used to handle the navigation of the navbar buttons. If moving away from the "chats" page,
    check if a compose is in progress, if so, navigate to the respective page and set the compose to false.
    If a compose is not in progress, navigate to the respective page with either the selected conversation or request id.
    (if one is selected)
*/
export const handleNavButtonChange = (
  index,
  navigate,
  composeContext,
  convoContext,
  requestContext,
  navContext
) => {
  navContext.setSelected(index);

  // Navigate to chats
  if (index === 0) {
    navigate(`/chats`);
  }
  // Navigate to people
  else if (index === 1) {
    switch (composeContext.compose) {
      case true:
        navigate(`people/none`);
        composeContext.setCompose(false);
        sessionStorage.removeItem("compose");
        break;
      case false:
        // If there is a selected conversation, navigate to the people page with the id of the conversation
        if (convoContext.selectedConversation) {
          navigate(`/people/${convoContext.selectedConversation}`);
        }
        // If there is a selected request, navigate to the people page with the id of the request
        else if (requestContext.selectedRequest) {
          navigate(`/people/${requestContext.selectedRequest}`);
        }
        // If neither is selected, navigate to the people page with the id of "none"
        else {
          navigate(`/people/none`);
        }
        break;
      default:
        break;
    }
  }
  // Navigate to requests
  else if (index === 2) {
    switch (composeContext.compose) {
      case true:
        navigate(`requests/none`);
        composeContext.setCompose(false);
        sessionStorage.removeItem("compose");
        break;
      case false:
        // If there is a selected conversation, navigate to the requests page with the id of the conversation
        if (convoContext.selectedConversation) {
          navigate(`/requests/${convoContext.selectedConversation}`);
        }
        // If there is a selected request, navigate to the requests page with the id of the request
        else if (requestContext.selectedRequest) {
          navigate(`/requests/${requestContext.selectedRequest}`);
        }
        // If neither is selected, navigate to the requests page with the id of "none"
        else {
          navigate(`/requests/none`);
        }
        break;
      default:
        break;
    }
  }
  // Navigate to archived
  else if (index === 3) {
    switch (composeContext.compose) {
      case true:
        navigate(`archived/none`);
        composeContext.setCompose(false);
        sessionStorage.removeItem("compose");
        break;
      case false:
        // If there is a selected conversation, navigate to the archived page with the id of the conversation
        if (convoContext.selectedConversation) {
          navigate(`/archived/${convoContext.selectedConversation}`);
        }
        // If there is a selected request, navigate to the archived page with the id of the request
        else if (requestContext.selectedRequest) {
          navigate(`/archived/${requestContext.selectedRequest}`);
        }
        // If neither is selected, navigate to the archived page with the id of "none"
        else {
          navigate(`/archived/none`);
        }
        break;
      default:
        break;
    }
  }
};
