import React, { useEffect } from "react";
import Chat from "./Components/Chat/Chat";
import Detail from "./Components/Detail/Detail";
import List from "./Components/List/List";
import Login from "./Components/Login/login";
import Notification from "./Components/Alert/Alert";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Library/firebase";
import { useUserStore } from "./Library/userStore";
import { useChatStore } from "./Library/chatStore";


const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
      console.log(user);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          <Detail />
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
