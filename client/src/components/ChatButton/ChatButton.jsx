import 'ChatButton.css';

function ChatButton(){

return(

    <button className="floating-chat-btn" onClick={() => setIsChatOpen(true)}>
            <FiMessageSquare style={{ height: '24px', width: '24px', strokeWidth: '3' }} />
    </button>

);
}

export default ChatButton;
