import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { useChatStore } from "../../Library/chatStore"
import { auth, database } from "../../Library/firebase"
import { useUserStore } from "../../Library/userStore"
import "./detail.css"

const Detail = () => {

    const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat} = useChatStore()
    const {currentUser} = useUserStore()

    const handleBlock = async () => {
    if(!user) return;

    const userDocRef = doc(database, "users", currentUser.id)
    try{
        await updateDoc(userDocRef,{
            blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
        });
        changeBlock()
    } catch(err){
        console.log(err)
    }
    }
    
    const handleLogout = () => {
        auth.signOut();
        resetChat()

    };
    return (
        <div className="detail">
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h2>{user?.username}</h2>
                <p>User description</p>
            </div>
            <div className="info">
                <div className="option">
                    </div>
                
                <button onClick={handleBlock}>{
                    isCurrentUserBlocked ? "You are blocked" : isReceiverBlocked ? "User blocked" : "Block user"
                    }</button>
                <button className="logout" onClick={handleLogout}>Logout</button>
            </div>
            </div>
    )
}

export default Detail