import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }){
    const [authenticated, setAuthenticated] = useState(null)

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch("http://localhost:8000/profile", {
                method: "GET",
                credentials: "include"
            })

            setAuthenticated(response.ok)
        }
        checkAuth()
    }, [])

    if (authenticated === null) {
        return <p>Loading...</p>
    }

    if(!authenticated) {
        return <Navigate to="/login" />
    }

    return children
}

export default ProtectedRoute