import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const useCheckIfAuthorised = () => {
    const[ token ] = useState(localStorage.getItem('token'))
    const [ user, setUser ] = useState(null)
    const [isAuthorised, setIsAuthorised] = useState(false)
    const [isChecking, setIsChecking] = useState(true)

    const checkToken = useCallback(async () => {
        if(!token) {
            setIsAuthorised(false)
            setIsChecking(false)
            return
        }
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setIsAuthorised(true)
            setUser(response.data.user)
            setIsChecking(false)
        } catch (error) {
            console.log(error)
            setIsAuthorised(false)
            setIsChecking(false)
        }
    }, [token, setIsAuthorised, setUser])


    useEffect(() => {
        checkToken()
    }, [checkToken])

    return [ isAuthorised, user, isChecking ]
}

export { useCheckIfAuthorised }
 