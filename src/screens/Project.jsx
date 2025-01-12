import React, { useEffect, useState, useContext, useRef } from 'react';
import { UserContext } from '../contex/user.contex';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../Config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../Config/socket';
import { useSwipeable } from 'react-swipeable';

const Project = () => {
    const location = useLocation();
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState([]);
    const [project, setProject] = useState(location.state?.project || {});
    const [message, setMessage] = useState('');
    const [reactions, setReactions] = useState({});
    const [users, setUsers] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);

    const { user } = useContext(UserContext);

    const messageBoxRef = useRef(null);
    const inputRef = useRef(null);

    const addCollaborators = () => {
        axios.put('/projects/add-user', {
            projectId: project._id,
            users: Array.from(selectedUserId),
        })
            .then((res) => {
                console.log(res.data);
                setIsModalOpen(false);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handelUserClick = (id) => {
        setSelectedUserId((preSelectedUserId) => {
            const newSelectedUserId = new Set(preSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }
            return newSelectedUserId;
        });
    };

    const send = () => {
        if (message.trim()) {
            sendMessage('project-message', {
                message,
                sender: user,
                replyTo: replyingTo,
            });
            appendOutgoingMessage(message);
            setMessage('');
            setReplyingTo(null);
            inputRef.current.focus();
        }
    };

    function scrollToBottom() {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }

    function formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    useEffect(() => {
        initializeSocket(project._id);

        receiveMessage('project-message', (data) => {
            appendIncomingMessage(data);
            scrollToBottom();
        });

        axios.get(`/projects/get-project/${project._id}`).then((res) => {
            setProject(res.data.project);
        });

        axios.get('/users/all').then((res) => {
            setUsers(res.data.users);
        }).catch((err) => {
            console.log(err);
        });

        const updateViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        window.addEventListener('resize', updateViewportHeight);
        updateViewportHeight();

        return () => {
            window.removeEventListener('resize', updateViewportHeight);
        };
    }, [project._id]);

    const swipeHandlers = useSwipeable({
        onSwipedRight: (eventData) => {
            const replyToMessageId = eventData.event.target.dataset.id;
            if (replyToMessageId) {
                setReplyingTo(replyToMessageId);
            }
        },
    });

    function appendIncomingMessage(messageObject) {
        const messageBox = document.querySelector('.message-box');
        const message = document.createElement('div');
        message.classList.add('incoming', 'message', 'flex', 'flex-col', 'p-2', 'bg-white', 'w-fit', 'max-w-[80%]', 'rounded-md', 'mt-2', 'mx-2', 'sm:mx-6', 'break-words');

        const time = formatTime(new Date());
        message.dataset.id = messageObject.id;
        message.innerHTML = `
        <small class='opacity-65 text-black text-xs'>${messageObject.sender.email}</small>
        <div class='flex justify-between gap-2 items-center'>
        <p class='text-sm text-black'>${messageObject.message}</p>
        <small class='opacity-65 text-xs self-end mt-1'>${time}</small>
        </div>
        `;

        messageBox.appendChild(message);
        scrollToBottom();
    }

    function appendOutgoingMessage(message) {
        const messageBox = document.querySelector('.message-box');
        const newMessage = document.createElement('div');
        newMessage.classList.add('outgoing', 'message', 'flex', 'flex-col', 'p-2', 'bg-green-200', 'w-fit', 'max-w-[80%]', 'rounded-md', 'mt-2', 'self-end', 'sm:ml-auto', 'break-words');

        const time = formatTime(new Date());
        newMessage.dataset.id = Date.now();

        newMessage.innerHTML = `
            <small class='opacity-65 text-xs'>${user.email}</small>
            <div class='flex justify-between gap-2 items-center'>
                <p class='text-sm'>${message}</p>
                <small class='opacity-65 text-xs self-end mt-1'>${time}</small>
            </div>
        `;

        messageBox.appendChild(newMessage);
        scrollToBottom();
    }

    return (
        <main className='h-screen w-screen flex'>
            <section className='left relative flex flex-col h-full w-full md:min-w-96 bg-[#645a5aab]' {...swipeHandlers}>
                <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 fixed z-10 top-0'>
                    <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
                        <i className="ri-add-fill"></i>
                        <p>Add Members</p>
                    </button>
                    <button className='p-2' onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>
                <div className='h-full' style={{ backgroundImage: "url('images/two.png')", backgroundSize: 'cover' }}>
                    <div className="conversation-area pt-12 pb-2 flex flex-col h-full fixed relative">
                        <div ref={messageBoxRef} className="message-box p-1 pb-20 flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"></div>
                        {replyingTo && (
                            <div className="reply-preview p-2 bg-gray-200 flex justify-between items-center">
                                <p>Replying to: {replyingTo}</p>
                                <button onClick={() => setReplyingTo(null)} className="text-red-500">Cancel</button>
                            </div>
                        )}
                        <div className="inputfiled w-full flex fixed pb-3 py-3 bottom-0 left-0 bg-white" style={{ height: `calc(var(--vh, 1vh) * 10)` }}>
                            <input
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        send();
                                    }
                                }}
                                className='p-2 px-4 boder-none outline-none flex-grow rounded-md mx-2 border placeholder-[#a8a1a1]'
                                type="text"
                                placeholder='Enter message'
                            />
                            <button onClick={send} className='px-6 bg-black text-white rounded-md mx-1'>
                                <i className="ri-send-plane-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`sidePannel w-full h-full flex flex-col gap-2 p-2 bg-green-200 absolute transition-all top-0 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <header className='flex justify-between items-center p-2 px-3 bg-slate-200'>
                        <h1>Collabrators</h1>
                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col gap-2">
                        {users.map((user) => (
                            <div key={user._id} className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                                <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                    <i className="ri-user-fill absolute"></i>
                                </div>
                                <h1 className='font-semibold text-lg text-black'>{user.email}</h1>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {isModalOpen && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white mx-8 p-4 rounded-md w-96 max-w-full relative">
                        <header className='flex justify-between items-center mb-4 mx-3'>
                            <h2 className='text-xl font-semibold'>Select User</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2'>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                        {users.map(user => (
                                <div 
                                    key={user._id} 
                                    className={`user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center 
                                       ${Array.from(selectedUserId).indexOf(user._id) !=-1 ? 'bg-slate-200' : ''}`} 
                                    onClick={() => handelUserClick(user._id)}
                                >
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    {/* <h1 className='font-semibold text-lg'>{user._id}</h1> */}

                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div>
                        <button  onClick={addCollaborators}  className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}

    </main> 
  )
}

export default Project
