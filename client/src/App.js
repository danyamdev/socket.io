import React, {useEffect, useReducer} from "react";
import axios from "axios";

import JoinBlock from "./components/JoinBlock";
import Chat from "./components/Chat";

import reducer from "./reducer";
import socket from "./socket";

const App = () => {
  const [state, dispatch] = useReducer(reducer, {
    joined: false,
    userName: '',
    roomId: '',
    users: [],
    messages: [],
  });

  const setUsers = (users) => {
    dispatch({
      type: 'SET_USERS',
      payload: users,
    });
  };

  const addMessage = (message) => {
    dispatch({
      type: 'SET_MESSAGES',
      payload: message,
    });
  };

  const onLogin = async (obj) => {
    dispatch({
      type: 'JOINED',
      payload: obj,
    });
    socket.emit('ROOM:JOIN', obj);
    const { data } = await axios.get(`/rooms/${obj.roomId}`);
    dispatch({
      type: 'SET_DATA',
      payload: data,
    });
  };

  useEffect(() => {
    socket.on('ROOM:SET_USERS', setUsers);
    socket.on('ROOM:NEW_MESSAGE', addMessage);
  }, []);

  return (
    <div className="App">
      {!state.joined ? <JoinBlock onLogin={onLogin}/> : <Chat {...state} addMessage={addMessage}/>}
    </div>
  );
}

export default App;
