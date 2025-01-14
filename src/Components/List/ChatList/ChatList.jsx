import { React, useEffect, useState } from "react"
import "./chatlist.css"
import AddUser from "./addUser/AddUser"
import { useUserStore, } from "../../../Library/userStore"
import { database } from "../../../Library/firebase"
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { useChatStore } from "../../../Library/chatStore"

const ChatList= () => {
    const [chats, setChats] = useState([])
    const [addMode, setAddMode] = useState(false)
    const {currentUser} = useUserStore()
    const {changeChat} = useChatStore()
    const [input, setInput] = useState("")

    useEffect(() =>{
        const unSub = onSnapshot
        (doc(database, "userchats", currentUser.id), 
        async (res) => {
            const items = res.data().chats

            const promises = items.map(async(item) => {
                const userDocRef = doc(database, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user = userDocSnap.data()

                return{...item, user}
            })

            const chatData = await Promise.all(promises)

            setChats(chatData.sort((a,b) => b.updatedAt - a.updatedAt))
        });

        return() => {
            unSub()
        }
    },[currentUser.id])

    const handleChangeChat = async (chat) => {
    console.log(chat)
    const userChats = chats.map(item=> {
        const {user, ...rest} = item

        return rest
    })

    const chatIndex = userChats.findIndex((item)=>item.chatId === chat.chatId )

    userChats[chatIndex].isSeen = true

    const userChatsRef = doc(database, "userchats", currentUser.id)

    try {

        await updateDoc(userChatsRef, {
            chats: userChats,
        })

        changeChat(chat.chatId,chat.user)

    } catch(err) {
        console.log(err)
    }
    }

    const filteredChats = chats.filter((c)=>c.user.username.toLowerCase().includes(input.toLowerCase()))


    return (
        <div className="chatList">
            <div className="search">
                <div className="searchBar">
                <img src="./search.png" alt="" />
                <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)}/>
            </div>
            <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className="add"
            onClick={()=>setAddMode ((prev) => !prev)}
            />
            
        </div>
        {filteredChats.map((chat,index) => (
        <div className="item" key={index} onClick={() => handleChangeChat(chat)}
        style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#90EE90"
        }}>
            <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"} alt="" />
            <div className="texts">
                <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
                <p>{chat.lastMessage}</p>
            </div>
        </div>
    ))}
        {addMode && <AddUser/>}
        </div>
    )
}

export default ChatList