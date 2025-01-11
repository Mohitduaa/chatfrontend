import React, { useContext, useState,useEffect } from 'react';
import { UserContext } from '../contex/user.contex';
import axios from '../Config/axios'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen , setIsModalOpen] = useState(false)
  const [projectName ,setProjectName] = useState(null)
  const [project ,setProject] = useState([])
  const navigate = useNavigate()

  function createProject(e) {
    e.preventDefault()
    console.log({ projectName });
    axios.post('/projects/create',{
        name: projectName,

      })
      .then((res)=>{
        console.log(res);
        setIsModalOpen(false)
        
      })
      .catch((error)=>{
        console.log(error);
        
      })
  }
  useEffect (() =>{
    axios.get('/projects/all').then((res) =>{
      setProject(res.data.project)
    }).catch(err =>{
      console.log(err)
    })
  },[])

  return (
    <main className='p-4'>
  <div className='projects flex flex-wrap gap-3'>
  <button
  onClick={()=> setIsModalOpen(true)} 
   className='project font-medium p-4 border border-late-300 rounded-md'>
  New Project
  <i className="ri-link ml-2 text-black"></i>
  </button>
  {
    project.map((project)=>(
      <div key={project._id} onClick={()=>{navigate(`/project`,{ state:{project}})}} className='project cursor-pointer p-4 border border-slate'>
      <h2 className='text-black text-xl font-medium'>{project.name}</h2>
      <div/>
      <div className='flex gap-1'>
      <p><i className="ri-user-line"></i></p>
      {project.users.length}
      <p className='text-black'>Collaborator</p>
      </div>
      </div>
    ))
  }
  </div>
  {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-md md:w-1/3">
                        <h2 className="text-xl font-medium mb-4">Create New Project</h2>
                        <form onSubmit={createProject}>
                            <div className="mb-4">
                                <label className="block text-xl font-medium text-black">Project Name</label>
                                <input placeholder='Enter name'
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div className="flex justify-end">
                                <button type="button" className="mr-2 px-4 py-2 bg-gray-300 rounded-md" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

    </main>
  );
};

export default Home;
