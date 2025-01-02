import React,{useEffect, useState ,useContext} from 'react'
import { UserContext } from '../contex/user.contex';
import {useNavigate ,useLocation } from 'react-router-dom';
import axios from '../Config/axios';
import { initializeSocket ,receiveMessage ,sendMessage } from '../Config/socket';

const Project = () => {
    const location = useLocation()
    const [isSidePanelOpen ,setIsSidePanelOpen] =useState(false)   
    const [isModalOpen , setIsModalOpen] = useState(false)
    const [selectedUserId , setSelectedUserId] = useState([]) 
    const [project , setProject] = useState (location.state.project)
    const [message,setMessage] = useState('')
    const { user } = useContext(UserContext)
    const messagebox = React.createRef();

    const [users,setUsers] = useState([])

    const addCollaborators = () => {
        // Assuming you have an API endpoint to add collaborators
        axios.put("/projects/add-user", { 
            projectId: location.state.project._id, // Assuming you pass project ID in location state
            users: Array.from(selectedUserId) 
        })
        .then(res => {
            console.log(res.data);
            setIsModalOpen(false);
        })
        .catch(err => {
            console.log(err);
        });
    };
    const handelUserClick = (id) =>{
        // selectedUserId([...selectedUserId, id])
        setSelectedUserId(preSelectedUserId =>{
            const newSelectedUserId = new Set(preSelectedUserId);
            if(newSelectedUserId.has(id)){
                newSelectedUserId.delete(id);
            }
            else{
                newSelectedUserId.add(id);
            }
            console.log(Array.from(newSelectedUserId));
            
            
            return newSelectedUserId;
        })
        console.log(selectedUserId);
    }
    const send = () =>{
    console.log(user);
    

        sendMessage('project-message',{
            message,
            sender: user
        })
        appendOutgoingMessage(message)
        setMessage("")
}

    useEffect(()=>{
        initializeSocket(project._id)

        receiveMessage('project-message',data =>{
            console.log(data);
            appendIncomingMessage(data)
            
        })
        axios.get(`/projects/get-project/${location.state.project._id}`).then(res =>{
            setProject(res.data.project)
        })

        axios.get('/users/all').then(res=>{
            setUsers(res.data.users)
        }).catch(err =>{
            console.log(err)
        })
    },[])


    function appendIncomingMessage(messageObject){
        const messageBox = document.querySelector('.message-box')
        const message = document.createElement('div')
        message.classList.add( 'incoming', 
            'message', 
            'flex', 
            'flex-col', 
            'p-2', 
            'bg-green-300', 
            'w-fit', 
            'rounded-md', 
            'mt-2', 
            'mx-5',
            )
        message.innerHTML = `
        <small class='opacity-65 text-xs'>${messageObject.sender.email}</small>
        <p class='text-sm'>${messageObject.message}</p>
        `
        messageBox.appendChild(message)
    }
    function appendOutgoingMessage(message) {
        const messageBox = document.querySelector('.message-box');
        const newMessage = document.createElement('div');
        newMessage.classList.add(
            'incoming', 
            'message', 
            'flex', 
            'flex-col', 
            'p-2', 
            'bg-yellow-500', 
            'w-fit', 
            'rounded-md', 
            'mt-2', 
            'mx-2',
            'ml-[15rem]'
        );
        newMessage.innerHTML = `
            <small class='opacity-65 text-xs'>${user.email}</small>
            <p class='text-sm'>${message}</p>
        `;
        messageBox.appendChild(newMessage);
    }
    
   
  return (
    <main className='h-screen w-screen flex'>

        <section className='left relative flex flex-col h-full min-w-96 bg-gray-200 '>
            <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0'>
            <button className='flex gap-2' onClick={() => setIsModalOpen(true)}> {/* Add onClick handler */}
            <i className="ri-add-fill"></i>
            <p>Add Members</p>
            </button>
            <button className='p-2 ' onClick={()=> setIsSidePanelOpen(!isSidePanelOpen)}>

            <i className="ri-group-fill"></i>
            </button>
            </header>
            <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
                <div ref={messagebox} className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
                 </div>
                    <div className="inputfiled w-full flex">
                        <input value={message} onChange={(e)=> setMessage(e.target.value)} className='p-2 px-4 boder-none outline-none flex-grow' type="text" placeholder='Enter message' />
                        <button onClick={send} className=' px-5 bg-black text-white'><i class="ri-send-plane-fill"></i></button>
                    </div>
            </div>
            <div className={`sidePannel w-full h-full flex flex-col gap-2  bg-gray-400 absolute transition-all  top-0 ${isSidePanelOpen?'translate-x-0':'-translate-x-full'}`}>
                 <header className='flex justify-between items-center p-2 px-3 bg-slate-200'>
                 <h1>Collabrators</h1>
                    <button onClick={()=> setIsSidePanelOpen(!isSidePanelOpen)}>
                        <i className="ri-close-fill"></i>
                    </button>
                 </header>
                 <div className="users flex flex-col gap-2">
                    
                    {users.map(user => {


              return (
                <div className="user flex gap-2 items-center">
                <div className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                  <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                  <i className="ri-user-fill absolute"></i>
                 </div>
                 <h1 className='font-semibold text-lg text-green-400'>{user.email}</h1>
                </div>
                </div>
)                


})}
                 </div>
            </div>
        </section>
        {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
                        <header className='flex justify-between items-center mb-4'>
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