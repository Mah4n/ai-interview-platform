import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError("")

        const response = await fetch("http://localhost:8000/register", {
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
        <div>
            <h1>Register</h1>
            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Email</label>
                    <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required/>
                </div>

                <div>
                    <label>Password</label>
                    <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required/>
                </div>

                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account?{" "}
                <button type="button" onClick={() => navigate("/login")}>
                    Login</button>
            </p>
        </div>
    )
}

export default Register