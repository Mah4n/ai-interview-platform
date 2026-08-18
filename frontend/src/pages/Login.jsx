import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login(){
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (event) => {
        event.preventDefault() 

        setError("")

        const formData = new URLSearchParams()
        formData.append("username", email)
        formData.append("password", password)

        const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            credentials: "include",
            body: formData
        })

        const data = await response.json()

        if (!response.ok){
            setError(data.detail)
            return
        }

        navigate("/dashboard")
    }

    return (
        <div>
            <h1>Login</h1>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>

                <div>
                    <label>Email</label>
                    <input 
                    type="email" 
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input 
                    type="password" 
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login