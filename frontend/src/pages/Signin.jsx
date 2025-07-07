import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckIfAuthorised } from '../hooks/useCheckIfAuthorised'
import Heading from '../components/Heading'
import Subheading from '../components/Subheading'
import LabelInput from '../components/LabelInput'
import ActionButton from '../components/ActionButton'
import ErrorDisplay from '../components/ErrorDisplay'
import Subtext from '../components/Subtext'
import axios from 'axios'
import zod from 'zod'

const SigninSchema = zod.object({
  email: zod.string({ required_error: "Email is required" }).email("Invalid Email"),
  password: zod.string({ required_error: "Password is required" })
})

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

function Signin() {
  const navigate = useNavigate()

  const heading = 'Welcome Back'
  const subheading = 'Sign in to your account to continue'
  const buttonText = 'Sign In'
  const linkText = 'Sign Up'
  const action = 'signin'
  const subtext = 'Don\'t have an account? '

  const [error, setError] = useState(null)
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  })

  const [ isAuthorised, , isChecking ] = useCheckIfAuthorised()

  useEffect(() => {
    if(isChecking === false && isAuthorised === true) {
      navigate('/')
    }
  }, [isChecking, isAuthorised, navigate])

  const onChange = (e) => {
    const { name, value } = e.target
    setSigninData(prevSigninData => ({ ...prevSigninData, [name]: value }))
  }

  const onClick = async () => {
    try {
      SigninSchema.parse(signinData)
      
      const data = {
        email: signinData.email,
        password: signinData.password
      }

      const response = await axios.post(`${BASE_URL}/api/v1/user/signin`, data)
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
        <div className='flex flex-col justify-center items-center bg-white shadow-lg border border-gray-200 rounded-lg pt-6 max-w-[360px] w-full mx-auto'>

            {/* Signin Form */}
            <div className='flex flex-col justify-center items-center mx-4'>
                <Heading label={heading} />
                <Subheading text={subheading} />
            </div>

            {/* Input Fields */}
            <div className='w-full px-6 py-4 bg-gradient-to-br from-purple-200 via-purple-100 to-white rounded-lg mt-6'>
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

export default Signin