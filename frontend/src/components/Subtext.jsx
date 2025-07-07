import {} from 'react'
import { useNavigate } from 'react-router-dom'

function Subtext({ subtext, linkText, action }) {
  const navigate = useNavigate();

  return (
    <div className='text-center'>
      <p className='text-gray-400 text-sm'>
        {subtext}
        <span onClick={() => navigate(action === 'signup' ? '/signin' : '/signup')} className='text-blue-600 cursor-pointer hover:underline'>{linkText}</span>
      </p>
    </div>
  )
}

export default Subtext