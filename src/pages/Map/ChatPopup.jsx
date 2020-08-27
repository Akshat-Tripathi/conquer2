import React from 'react';
import { Chat, addResponseMessage, addLinkSnippet, addUserMessage } from 'react-chat-popup';
import { GameContext } from './Map';
import { action } from '../Map/ActionButtons';
import './ChatPopup.css';

class ChatPopup extends React.Component {
	componentDidMount() {
		addResponseMessage('Shashwat' + '\n\n' + 'Welcome to the Conquer 2 Chat!');
	}

	handleNewUserMessage = (newMessage) => {
		console.log(`New message incoming! ${newMessage}`);

		// send the message through the backend
		var sendmsg = new action(0, 'sendChatMessage', newMessage, '', this.props.user);
		GameContext.socket.send(JSON.stringify(sendmsg));
	};

	render() {
		return (
			<div className="chat">
				<Chat
					style={{ backroundColor: '#242424' }}
					handleNewUserMessage={this.handleNewUserMessage}
					title="C O N Q U E R 2.0"
					subtitle="Welcome to the chat!"
					senderPlaceHolder="Type to send message"
				/>
			</div>
		);
	}
}

export default ChatPopup;
