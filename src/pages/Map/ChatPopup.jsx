import React, { useEffect } from 'react';
import { Chat, addResponseMessage, addLinkSnippet, addUserMessage } from 'react-chat-popup';
import { GameContext } from './Map';
import { action } from '../Map/ActionButtons';
import './ChatPopup.css';

function ChatPopup() {
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

		// send the message through the backend
		var sendmsg = new action(0, 'chatMessageSent', newMessage, '', this.props.user);
		GameContext.socket.send(JSON.stringify(sendmsg));
	};

	return (
		<div className="chat">
			<Chat
				style={{ backroundColor: '#242424' }}
				handleNewUserMessage={(newMessage) => handleNewUserMessage(newMessage)}
				title="C O N Q U E R 2.0"
				subtitle="Welcome to the chat!"
				senderPlaceHolder="Type to send message"
			/>
		</div>
	);
}

export default ChatPopup;
