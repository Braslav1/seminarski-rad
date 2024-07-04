import React from "react"
import UserInfo from "./UserInfo/UserInfo"
import ChatList from "./ChatList/ChatList"
import "./list.css"

const List = () => {
    return (
        <div className="list">
            <UserInfo />
            <ChatList />
        </div>
    )
}

export default List