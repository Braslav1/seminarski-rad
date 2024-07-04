import { React, useState, useRef, useEffect, useMemo } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { database } from "../../Library/firebase";
import { useChatStore } from "../../Library/chatStore";
import { useUserStore } from "../../Library/userStore";
import upload from "../../Library/uploads";

const Chat = () => {
  const [chat, setChat] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const drone = useMemo(() => new window.Scaledrone("DbSGlb3bBa7ofwWh"), []);
  const roomName = "observable-room";

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const room = drone.subscribe(roomName);

    room.on("open", (error) => {
      if (error) {
        console.error("Failed to join room:", error);
      } else {
        console.log("Joined room successfully");
      }
    });

    room.on("data", async (message) => {
      console.log(chat);
      const newMessage = {
        text: message.text,
        senderId: currentUser.id,
        createdAt: new Date(),
        img: message.img,
      };

      const messageChatId = chatId;

      await updateDoc(doc(database, "chats", messageChatId), {
        messages: arrayUnion(newMessage),
      });

      const userIDs = [currentUser.id, user.id];

      for (const id of userIDs) {
        const userChatsRef = doc(database, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === messageChatId
          );
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = message.text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }

      setChat((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      room.unsubscribe();
    };
  }, [drone, roomName, currentUser, chat, chatId, user, text]);

  useEffect(() => {
    if (!chatId) return;

    const fetchChatMessages = async () => {
      const chatDoc = await getDoc(doc(database, "chats", chatId));
      if (chatDoc.exists()) {
        setChat(chatDoc.data().messages || []);
      }
    };

    fetchChatMessages();
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;
    if (!chatId) return;
    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      const message = {
        text,
        img: imgUrl,
        senderId: currentUser.id,
        createdAt: new Date(),
      };

      drone.publish({
        room: roomName,
        message,
      });

      await updateDoc(doc(database, "chats", chatId), {
        messages: arrayUnion(message),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(database, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
      setChat((prevMessages) => [...prevMessages, message]);
    } catch (err) {
      console.log(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isCurrentUserBlocked && !isReceiverBlocked) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor, sit amet.</p>
          </div>
        </div>
      </div>
      <div className="center">
        {chat.map((message, index) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={index}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
