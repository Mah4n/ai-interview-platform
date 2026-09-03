import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"
import "./InterviewSetup.css"

function InterviewSetup() {
    const navigate = useNavigate()
    const [role, setRole] = useState("")
    const [difficulty, setDifficulty] = useState("Beginner")
    const [interviewType, setInterviewType] = useState("Technical")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()

        setError("")
        setLoading(true)
        
        try{
            const response = await fetch(`${API_URL}/interviews/generate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    role: role,
                    difficulty: difficulty,
                    interview_type: interviewType
                })
            })

            const data = await response.json()

            if(!response.ok){
                setError(data.detail)
                return
            }

            navigate(`/interview/${data.interview_id}`)
        } catch {
            setError("Could not connect to the server.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="setup-page">

            <div className="setup-card">

                <h1>Set Up Interview</h1>
                <p className="setup-subtitle">Choose the role, difficulty and interview type.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Role</label>
                        <input 
                        type="text"
                        value={role}
                        onChange = {(event) => setRole(event.target.value)}
                        placeholder="e.g. Software Engineer"
                        required/>
                    </div>

                    <div className="form-group">
                        <label>Difficulty</label>
                        <select
                        value={difficulty}
                        onChange={(event) => setDifficulty(event.target.value)}>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Interview Type</label>

                        <select
                        value={interviewType}
                        onChange={(event) => setInterviewType(event.target.value)}>
                            <option value="Technical">Technical</option>
                            <option value="Behavioural">Behavioural</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>

                    {error && <p className="setup-error">{error}</p>}

                    <div className="setup-actions">

                        <button type="button" 
                        disabled={loading} 
                        className="secondary-button" 
                        onClick={() => navigate("/dashboard")}>
                            Back
                        </button>

                        <button type="submit" disabled={loading}>
                            {loading ? "Generating..." : "Generate Interview"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default InterviewSetup