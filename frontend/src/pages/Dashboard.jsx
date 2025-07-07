import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import GraphViewer from '../components/GraphViewer'
import Navbar from '../components/Navbar'
import { useCheckIfAuthorised } from '../hooks/useCheckIfAuthorised'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => setIsOpen(!isOpen)
  const navigate = useNavigate()

  const [reRender, setReRender] = useState(false)
  const [isAuthorised, user, isChecking] = useCheckIfAuthorised()
  const [repositories, setRepositories] = useState([])
  const [activeRepoId, setActiveRepoId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if(isChecking === false && isAuthorised === false) {
      navigate('/signin')
    }
  }, [isChecking, isAuthorised, navigate])

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/api/v1/repo/allRepos`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        setRepositories(response.data.repos || [])
        setLoading(false)
        setError(null)
      } catch {
        setError("Failed to load repositories")
        setLoading(false)
      }
    }
    fetchRepositories()
  }, [reRender])

  if (isChecking || loading || !user) {
    return <div>Loading...</div>
  }

    return (
    <div className='flex flex-col h-screen'>
        <Navbar onRepoAdded={() => setReRender(!reRender)} user={user} repositories={repositories} setActiveRepoId={setActiveRepoId} />   
        <div className='flex flex-row h-full'>
          <Sidebar isOpen={isOpen} onToggle={onToggle} onRepoDeleted={() => setReRender(!reRender)} setActiveRepoId={setActiveRepoId} repositories={repositories} error={error} loading={loading} />
          <GraphViewer activeRepoId={activeRepoId} />
        </div>
    </div>
  )
}

export default Dashboard