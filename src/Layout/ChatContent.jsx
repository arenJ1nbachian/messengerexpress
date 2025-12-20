import { useContext } from "react";
import { UserContext } from "../Contexts/UserContext";
import BubbleMessage from "../Components/BubbleMessage";
import "./ChatContent.css";
import { ChatCacheContext } from "../Contexts/ChatCacheContext";
import { ComposeContext } from "../Contexts/ComposeContext";
import { ConversationContext } from "../Contexts/ConversationContext";
import { RequestContext } from "../Contexts/RequestContext";
import { UserTypingContext } from "../Contexts/UserTypingContext";

const ChatContent = ({ request }) => {
  const userContext = useContext(UserContext);
  const chatCacheContext = useContext(ChatCacheContext);
  const composeContext = useContext(ComposeContext);
  const convoContext = useContext(ConversationContext);
  const requestContext = useContext(RequestContext);
  const userTypingContext = useContext(UserTypingContext);

  return request ? (
    <div className="chat scrollBar">
      {requestContext.requests
        ?.get(requestContext.selectedRequest)
        .messages?.map((message) => (
          <BubbleMessage
            key={message._id}
            content={message.content}
            isSentByUser={message.sender === userContext.userId}
          />
        ))}
    </div>
  ) : composeContext.compose && composeContext.selectedElement ? (
    <div className="chat scrollBar">
      {chatCacheContext.chatCache.size > 0 &&
        chatCacheContext.chatCache
          ?.get(composeContext.selectedElement.convoId)
          ?.map((message) => (
            <BubbleMessage
              key={message._id}
              content={message.content}
              isSentByUser={message.sender === userContext.userId}
            />
          ))}
    </div>
  ) : (
    <div className="chat scrollBar">
      {userTypingContext.usersTyping.has(
        convoContext.selectedConversationRef.current
      ) && (
        <div className="bubble-message-container">
          <div className="bubble-message received typing-bubble">
            <div className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      )}
      {chatCacheContext.chatCache.size > 0 &&
        !composeContext.compose &&
        chatCacheContext.chatCache
          ?.get(convoContext.selectedConversation)
          ?.map((message) => (
            <BubbleMessage
              key={message._id}
              content={message.content}
              isSentByUser={message.sender === userContext.userId}
            />
          ))}
    </div>
  );
};

export default ChatContent;
