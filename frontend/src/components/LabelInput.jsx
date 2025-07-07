import {} from 'react'

function LabelInput({ label, placeholder, onChange, name }) {
  return (
    <>
        <h4 className='text-md font-semibold items-start self-start mt-2'>{label}</h4>
        <input 
          onChange={onChange}
          type='text' 
          className='w-full p-2 my-2 border border-gray-200 bg-white rounded-lg mb-4 text-gray-600' 
          placeholder={placeholder} 
          name={name}
        />
    </>
  )
}

export default LabelInput