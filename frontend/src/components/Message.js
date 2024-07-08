import React from 'react';

const Message = ({ role, content }) => {
  return (
    <div className={`message ${role}`}>
      <strong>{role === 'user' ? 'You' : 'Bot'}:</strong> {content}
    </div>
  );
};

export default Message;