import React, { useEffect, useState, useContext, useRef } from 'react';
import { UserContext } from '../contex/user.contex';
import { useLocation } from 'react-router-dom';
import axios from '../Config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../Config/socket';
import { useSwipeable } from 'react-swipeable';

// Global helper function for time formatting
const formatTime = (date) => {
  if (!(date instanceof Date)) return '';
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = (hours % 12 || 12).toString();
  return `${formattedHours}:${minutes} ${ampm}`;
};

const Message = ({ message: msg, user, setReplyingTo }) => {
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      setReplyingTo(msg.message);
    },
    trackMouse: true
  });

  return (
    <div
      {...swipeHandlers}
      className={`message flex flex-col p-2 w-fit max-w-[80%] rounded-md mt-2 mx-2 sm:mx-6 break-words ${
        msg.type === 'outgoing' 
          ? 'bg-green-200 self-end sm:ml-auto' 
          : 'bg-white'
      }`}
    >
      <small className='opacity-65 text-black text-xs'>
        {msg.type === 'outgoing' ? user.email : msg.sender?.email}
      </small>
      {msg.replyTo && (
        <p className="text-sm p-2 rounded-md shadow-md bg-gray-100">
          {msg.replyTo}
        </p>
      )}
      <div className='flex justify-between gap-2 items-center'>
        <p className='text-sm text-black'>{msg.message}</p>
        <small className='opacity-65 text-xs self-end mt-1'>
          {formatTime(msg.timestamp)}
        </small>
      </div>
    </div>
  );
};

// Main Project Component
const Project = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const messageBoxRef = useRef(null);
  const inputRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state?.project || {});
  const [users, setUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }
  }, []);

  // Show notification when a new message arrives
  const showNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Message', {
        body: `${message.sender?.email || 'Someone'}: ${message.message}`,
        icon: '/image1.webp', // Add an icon if needed
      });
    }
  };

  // Socket and data initialization
  useEffect(() => {
    initializeSocket(project._id);
    
    receiveMessage('project-message', (data) => {
      const newMessage = {
        ...data,
        type: 'incoming',
        id: Date.now(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();

      // Show notification for new incoming messages
      if (data.sender._id !== user._id) { // Avoid notifications for your own messages
        showNotification(newMessage);
      }
    });

    const fetchData = async () => {
      try {
        const projectRes = await axios.get(`/projects/get-project/${project._id}`);
        setProject(projectRes.data.project);
        
        const usersRes = await axios.get('/users/all');
        setUsers(usersRes.data.users);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [project._id, user._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageHandler = () => {
    if (messageInput.trim()) {
      const newMessage = {
        message: messageInput,
        sender: user,
        replyTo: replyingTo,
        type: 'outgoing',
        id: Date.now(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      sendMessage('project-message', newMessage);
      setMessageInput('');
      setReplyingTo(null);
      inputRef.current.focus();
    }
  };

  const handleAddCollaborators = async () => {
    try {
      await axios.put('/projects/add-user', {
        projectId: project._id,
        users: Array.from(selectedUserId),
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserSelect = (id) => {
    setSelectedUserId(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  return (
    <main className='h-screen w-screen flex'>
      {/* Chat Section */}
      <section className='left relative flex flex-col h-full w-full md:min-w-96 bg-[#645a5aab]'>
        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 fixed z-10 top-0'>
          <button 
            className='flex gap-2 items-center'
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-add-fill"></i>
            <span>Add Members</span>
          </button>
          <button 
            className='p-2'
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        {/* Messages Container */}
        <div className='h-full' style={{ backgroundImage: "url('images/two.png')", backgroundSize: 'cover' }}>
          <div className="conversation-area pt-12 pb-2 flex flex-col h-full fixed relative">
            <div 
              ref={messageBoxRef} 
              className="message-box p-1 pb-20 flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
            >
              {messages.map((msg) => (
                <Message 
                  key={msg.id} 
                  message={msg} 
                  user={user}
                  setReplyingTo={setReplyingTo}
                />
              ))}
            </div>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="reply-preview absolute bottom-[6rem] left-0 w-full p-2 bg-gray-200 flex justify-between items-center z-20">
                <p className='font-normal truncate'>{replyingTo}</p>
                <button 
                  onClick={() => setReplyingTo(null)} 
                  className="text-black px-2 hover:bg-gray-300 rounded"
                >
                  ×
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="input-field w-full flex fixed pb-3 py-3 bottom-0 left-0 bg-white">
              <input
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessageHandler()}
                className='p-2 px-4 border-none outline-none flex-grow rounded-md mx-2 placeholder-[#a8a1a1]'
                type="text"
                placeholder='Enter message'
              />
              <button 
                onClick={sendMessageHandler}
                className='px-6 bg-black text-white rounded-md mx-1 hover:bg-gray-800 transition-colors'
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Collaborators Side Panel */}
        <div className={`side-panel w-full h-full flex flex-col gap-2 p-2 bg-green-200 absolute transition-transform top-0 ${
          isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <header className='flex justify-between items-center p-2 px-3 bg-slate-200'>
            <h1 className='font-semibold'>Collaborators</h1>
            <button 
              onClick={() => setIsSidePanelOpen(false)}
              className='p-1 hover:bg-gray-300 rounded'
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2 overflow-auto">
            {users.map((user) => (
              <div key={user._id} className="user p-2 flex gap-2 items-center hover:bg-slate-200">
                <div className='w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white'>
                  <i className="ri-user-fill"></i>
                </div>
                <h1 className='font-semibold text-black'>{user.email}</h1>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add Collaborators Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white mx-4 p-4 rounded-md w-96 max-w-full relative">
            <header className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Select Collaborators</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className='p-2 hover:bg-gray-100 rounded'
              >
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map(user => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user._id)}
                  className={`user p-2 flex gap-2 items-center cursor-pointer rounded ${
                    selectedUserId.has(user._id) ? 'bg-slate-200' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className='w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white'>
                    <i className="ri-user-fill"></i>
                  </div>
                  <h1 className='font-semibold'>{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddCollaborators}
              className='w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              Add Selected Users
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;