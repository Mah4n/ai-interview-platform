import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import "./Auth.css"

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("http://localhost:8000/reset-password", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            token: token,
            new_password: newPassword})
        })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || "Unable to reset password.")
        return
      }

      setMessage(data.message)

    } catch {
      setError("Could not connect to the server.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">

          <h1>Invalid Reset Link</h1>
          <p className="auth-error">This password reset link is invalid.</p>

          <button className="auth-submit" onClick={() => navigate("/forgot-password")}>
            Request New Link
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Reset Password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>

        {error && (<p className="auth-error">{error}</p>)}
        {message && (<p className="auth-success">{message}</p>)}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required/>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (<p className="auth-switch">Password changed successfully.{" "}
            <button className="text-button" onClick={() => navigate("/login")}>
              Login
            </button>
          </p>
        )}

      </div>
    </div>
  )
}

export default ResetPassword