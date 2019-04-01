import { takeEvery, put, call, take } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import * as types from "../constants/ActionTypes";
import { setupSocket, sendMessage } from "../sockets";

import username from "../utils/name";
import { messageReceived, populateUsersList } from "../actions";

const handleNewMessage = function* handleNewMessage() {
  yield takeEvery(types.ADD_MESSAGE, action => {
    action.author = username;
    sendMessage(action);
  });
};

function* setupSocketWatcher() {
  const socket = setupSocket({
    username
  });

  const socketChannel = yield call(createSocketChannel, socket);

  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      const action = yield take(socketChannel);
      yield put(action);
    } catch (err) {
      console.error("socket error:", err);
      // socketChannel is still open in catch block
      // if we want end the socketChannel, we need close it explicitly
      // socketChannel.close()
    }
  }
}

const handleSetup = function* handleNewMessage(params) {
  yield takeEvery(types.SETUP, setupSocketWatcher);
};

// this function creates an event channel from a given socket
// Setup subscription to incoming `ping` events
function createSocketChannel(socket) {
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel(emit => {
    const pingHandler = event => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      emit(event.payload);
    };

    const errorHandler = errorEvent => {
      // create an Error object and put it into the channel
      emit(new Error(errorEvent.reason));
    };

    socket.onmessage = event => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case types.ADD_MESSAGE:
          emit(messageReceived(data.message, data.author));
          break;
        case types.USERS_LIST:
          emit(populateUsersList(data.users));
          break;
        default:
          break;
      }
    };

    socket.onerror = errorHandler;

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      socket.off("ping", pingHandler);
    };

    return unsubscribe;
  });
}

export default function* fdasjlk() {
  yield [handleNewMessage(), handleSetup()];
}
