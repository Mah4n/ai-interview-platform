import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Auth.css"

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
        <div className="auth-page">
            <div className="auth-card">
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Sign in to continue your interview preparation.</p>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                        id="email"
                        type="email" 
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                        id = "password"
                        type="password" 
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        required
                        />
                    </div>

                    <button type="button" className="forgot-password-link" onClick={() => navigate("/forgot-password")}>
                        Forgot Password? 
                    </button>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="auth-submit" type="submit">Login</button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <button type="button" className="text-button" onClick={() => navigate("/register")}>
                        Register
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Login