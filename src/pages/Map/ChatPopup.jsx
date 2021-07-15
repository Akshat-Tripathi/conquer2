import React, { useEffect } from "react";
import {
  Chat,
  addResponseMessage,
  addLinkSnippet,
  addUserMessage,
} from "react-chat-popup";
import { GameContext } from "./Map";

class ChatPopup extends React.Component {
  constructor() {
    super();
    this.handleNewUserMessage.bind(this);
  }

  componentWillUnmount() {
    addResponseMessage("Welcome to the Conquer2 Game Chat", GameContext.user);
  }

  handleNewUserMessage = (newMessage) => {
    console.log(`New message incoming! ${newMessage}`);
    GameContext.chatSocket.send(newMessage);
  };

  render() {
    return (
      <div className="">
        <Chat
          className="text-center"
          handleNewUserMessage={this.handleNewUserMessage}
          title="C O N Q U E R 2.0"
          subtitle="Welcome to the game chat!"
          senderPlaceHolder="Type to send message"
        />
      </div>
    );
  }
}

export default ChatPopup;
