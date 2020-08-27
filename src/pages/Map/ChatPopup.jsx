import React from 'react';

const ChatPopup = () => {
	return (
		<div class="chat-popup" id="myForm">
			<form action="/action_page.php" class="form-container">
				<h1>Chat</h1>

				<label for="msg">
					<b>Message</b>
				</label>
				<textarea placeholder="Type message.." name="msg" required />

				<button type="submit" class="btn">
					Send
				</button>
				<button type="button" class="btn cancel" onclick="closeForm()">
					Close
				</button>
			</form>
		</div>
	);
};

export default ChatPopup;
