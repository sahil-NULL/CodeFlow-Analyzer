import {} from 'react'

function ErrorDisplay({ error }) {
  return (
    <div>
      {error && <p className='text-red-400 text-sm text-center mt-2'>{error}</p>}
    </div>
  )
}

export default ErrorDisplay