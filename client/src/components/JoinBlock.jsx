import React, { useState } from 'react';
import axios from "axios";

import socket from '../socket';

const JoinBlock = ({ onLogin }) => {
	const [roomId, setRoomId] = useState("");
	const [name, setName] = useState("");

	const onEnter = async () => {
		await axios.post("/rooms", { roomId, name })
			.then(() => onLogin({ userName: name, roomId }))
			.catch(e => console.log(e));
	}

	return (
		<div className="join-block">
			<input type="text" placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)}/>
			<input type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)}/>
			<button className="btn btn-success" onClick={onEnter}>ВОЙТИ</button>
		</div>
	);
};

export default JoinBlock;