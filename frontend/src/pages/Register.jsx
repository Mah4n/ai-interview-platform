import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config"
import "./Auth.css"

function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError("")

        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email: email, password: password})
        })

        const data = await response.json()

        if(!response.ok){
            if (Array.isArray(data.detail)){
                setError(data.detail[0].msg)
            } else {
                setError(data.detail)
            }
            return
        }
        navigate("/login")
    }

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Create Account</h1>
                <p className="auth-subtitle">Create an account to start practising tailored interviews.</p>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Create a password"
                        required/>
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="auth-submit" type="submit">Create Account</button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <button type="button" className="text-button" onClick={() => navigate("/login")}>
                        Login
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Register