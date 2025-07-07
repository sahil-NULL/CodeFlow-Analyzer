import {} from 'react'

function ActionButton({ text, onClick }) {
  return (
    <>
      <button 
      className='w-full bg-purple-500 text-white font-bold text-sm p-3 my-6 rounded-lg cursor-pointer hover:bg-purple-900 transition ease-in-out duration-300'
      onClick={onClick}
      >
        {text}</button>
    </>
  )
}

export default ActionButton