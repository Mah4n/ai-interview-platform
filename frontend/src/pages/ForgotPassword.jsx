import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config"
import "./Auth.css"

function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({email: email})
        })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || "Something went wrong.")
        return
      }

      setMessage(data.message)

    } catch {
      setError("Could not connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Forgot Password?</h1>

        <p className="auth-subtitle">Enter your email and we'll send you a password reset link.</p>

        {error && (<p className="auth-error">{error}</p>)}

        {message && (<p className="auth-success">{message}</p>)}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required/>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <p className="auth-switch"> Remember your password?{" "}
          <button className="text-button" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>

      </div>
    </div>
  )
}

export default ForgotPassword