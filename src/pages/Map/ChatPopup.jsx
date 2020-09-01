import React, { useEffect } from 'react';
import { Chat, addResponseMessage, addLinkSnippet, addUserMessage } from 'react-chat-popup';
import { GameContext } from './Map';
import './ChatPopup.css';

function ChatPopup2() {
	// componentDidMount() {
	// 	addResponseMessage('Welcome to the Conquer 2 Chat!');
	// }

	useEffect(() => {
		if (GameContext.globalChat.length !== 0) {
			let lastmessage = GameContext.globalChat.pop();
			let username = Object.keys(lastmessage)[0];
			let message = Object.values(lastmessage)[0];
			addResponseMessage(username + '\n\n' + message);
		}
	}, []);

	const handleNewUserMessage = (newMessage) => {
		console.log(`New message incoming! ${newMessage}`);

		GameContext.chatSocket.send(newMessage);
	};

	return (
		<div className="chat">
			<Chat
				style={{ backgroundColor: '#242424' }}
				handleNewUserMessage={() => handleNewUserMessage()}
				title="C O N Q U E R 2.0"
				subtitle="Welcome to the chat!"
				senderPlaceHolder="Type to send message"
			/>
		</div>
	);
}

class ChatPopup extends React.Component {

	constructor() {
		super();
		this.handleNewUserMessage.bind(this);
	}

	componentDidMount() {
		addResponseMessage("Welcome to the Conquer2 Game Chat ", GameContext.user );
	}

	componentDidUpdate() {
		if (GameContext.globalChat.length !== 0) {
			let lastmessage = GameContext.globalChat.pop();
			let username = Object.keys(lastmessage)[0];
			let message = Object.values(lastmessage)[0];
			addResponseMessage(username + '\n\n' + message);
		}
	}

	handleNewUserMessage = (newMessage) => {
		console.log(`New message incoming! ${newMessage}`);

		GameContext.chatSocket.send(newMessage);
	};

	render() {
		return (
			<div className="chat">
			<Chat
				style={{ backgroundColor: '#242424' }}
				handleNewUserMessage={this.handleNewUserMessage}
				title="C O N Q U E R 2.0"
				subtitle="Welcome to the game chat!"
				senderPlaceHolder="Type to send message"
			/>
		</div>
		)
	}
}

export default ChatPopup;
