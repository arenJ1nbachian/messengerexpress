import React from "react";
import "./BubbleMessage.css";

const BubbleMessage = ({ content, isSentByUser }) => {
  return (
    <div
      className={`bubble-message ${isSentByUser ? "sent" : "received"}`}
      title={content}
    >
      {content}
    </div>
  );
};

export default BubbleMessage;
