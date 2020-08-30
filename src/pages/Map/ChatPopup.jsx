import React, { useEffect, Component } from 'react';
import { Chat, addResponseMessage, addLinkSnippet, addUserMessage } from 'react-chat-popup';
import { GameContext } from './Map';
import { action } from '../Map/ActionButtons';
import './ChatPopup.css';

// var equal = require('fast-deep-equal');

function ChatPopup({globalChat}) {
	// componentDidMount() {
	// 	addResponseMessage('Welcome to the Conquer 2 Chat!');
	// }

	useEffect(() => {
		if (globalChat.length !== 0) {
			let lastmessage = globalChat.pop();
			let username = Object.keys(lastmessage)[0];
			let message = Object.values(lastmessage)[0];
			addResponseMessage(username + '\n\n' + message);
		}
	}, [globalChat]);

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
				title="CONQUER 2.0 Game Chat"
				subtitle="Welcome to the chat!"
				senderPlaceHolder="Type to send message"
			/>
		</div>
	);
}

class ChatPopup2 extends Component {
	constructor() {
		super();
		this.handleNewUserMessage = this.handleNewUserMessage.bind(this);
	}


	componentDidMount() {
		addResponseMessage('Welcome to the Conquer 2 Chat!');
	}

	componentDidUpdate() {
		console.log('update time')
		let globalChat = GameContext.globalChat;
		console.log("this is globalchat var: ", globalChat);
		if (globalChat.length > 0) {
			console.log('updating states...')
			let lastmessage = globalChat.pop();
			let username = Object.keys(lastmessage)[0];
			console.log('username: ', username);
			console.log('user: ', GameContext.user)
			let message = Object.values(lastmessage);
			console.log('message: ', message)
			if (username.trim() !== GameContext.user.trim()) {
				addResponseMessage(username + ':\n\n' + message);
			}
		}
	}

	handleNewUserMessage = (newMessage) => {
		console.log(`New message incoming! ${newMessage}`);

		// send the message through the backend
		var sendmsg = new action(0, 'chatMessageSent', newMessage, '', GameContext.user);
		GameContext.socket.send(JSON.stringify(sendmsg));
	};

	render() {
		return (
			<div className="chat">
				<Chat
				style={{ backgroundColor: '#242424' }}
				handleNewUserMessage={this.handleNewUserMessage}
				title="CONQUER 2.0 Game Chat"
				subtitle="Engage in global diplomacy!"
				senderPlaceHolder="Type to send message"
			/>
			</div>
		)
	}
}


export default ChatPopup2;
