import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckIfAuthorised } from '../hooks/useCheckIfAuthorised'
import Heading from '../components/Heading'
import Subheading from '../components/Subheading'
import LabelInput from '../components/LabelInput'
import ActionButton from '../components/ActionButton'
import ErrorDisplay from '../components/ErrorDisplay'
import Subtext from '../components/Subtext'
import zod from 'zod'
import axios from 'axios'

const SignupSchema = zod.object({
  username: zod.string().max(100).min(3, {"message": "Username must be at least 3 characters long"}),
  email: zod.string().email("Invalid Email"),
  password: zod.string({ required_error: "Password is required" }).min(6, {"message": "Password must be at least 6 characters long"}).max(100)
})

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

function Signup() {
  const navigate = useNavigate()
  
  const heading = 'CodeFlow Analyzer'
  const subheading = 'Visualize and analyze your project\'s inter-connected code structure'
  const buttonText = 'Create Account'
  const linkText = 'Login'
  const action = 'signup'
  const subtext = 'Already have an account? '

  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const [error, setError] = useState(null)
  const [isAuthorised, , isChecking] = useCheckIfAuthorised()

  useEffect(() => {
    if(isChecking === false && isAuthorised === true) {
      navigate('/')
    }
  }, [isChecking, isAuthorised, navigate])


  const onChange = (e) => {
    const { name, value } = e.target
    setSignupData(prevSignupData => ({ ...prevSignupData, [name]: value }))
  }

  const onClick = async () => {
    try {
      SignupSchema.parse(signupData)

      const data = {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password
      }

      const response = await axios.post(`${BASE_URL}/api/v1/user/signup`, data)

      localStorage.setItem('token', response.data.token)
      setError(null)
      navigate('/')

    } catch (error) {
      if (error instanceof zod.ZodError) {
        const firstIssue = error.issues?.[0]?.message || 'Invalid input';
        setError(firstIssue);
      }
      else if(error.response?.data?.message) {
        setError(error.response?.data?.message)
      }
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-h-screen bg-white'>
      {/* Signup Form */}
      <div className='flex flex-col justify-center items-center bg-white shadow-lg border border-gray-200 rounded-lg pt-6 max-w-[360px] w-full mx-auto'>
        
        {/* Heading and Subheading */}
        <div className='flex flex-col justify-center items-center mx-4'>
          <Heading label={heading} />
          <Subheading text={subheading} />
        </div>

        {/* Input Fields */}
        <div className='w-full px-6 py-4 bg-gradient-to-br from-purple-200 via-purple-100 to-white rounded-lg mt-6'>
          <LabelInput label='Username' name='username' placeholder='Enter your username' onChange={onChange} />
          <LabelInput label='Email' name='email' placeholder='Enter your email' onChange={onChange} />
          <LabelInput label='Password' name='password' placeholder='Enter your password' onChange={onChange} />

          <ErrorDisplay error={error} />
          
          <ActionButton text={buttonText} onClick={onClick} /> 

          <Subtext subtext={subtext} linkText={linkText} action={action} />
        </div> 
      </div>
    </div>
  )
}

export default Signup