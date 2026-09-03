import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./InterviewHistory.css"

function InterviewHistory() {
    const [interviews, setInterviews] = useState([])
    const [error, setError] = useState("")
    const navigate = useNavigate()

    useEffect (() => {
        const getHistory = async () => {
            try {
                const response = await fetch("http://localhost:8000/interviews/history",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                )

                const data = await response.json()

                if(!response.ok){
                    setError(data.detail)
                    return 
                }

                setInterviews(data)
            } catch (error) {
                console.error(error)
                setError("Could not load interview history.")
            }
        }
        getHistory()
    }, [])


    const handleRestart = async (interviewId) => {
        const confirmed = window.confirm("Are you sure you want to restart this interview?")

        if(!confirmed){return}

        const response = await fetch(`http://localhost:8000/interviews/${interviewId}/restart`, {
            method: "POST",
            credentials: "include"
        })

        const data = await response.json()

        if(!response.ok){
            setError(data.detail)
            return
        }
        navigate(`/interview/${interviewId}`)
    }

    const handleDelete = async (interviewId) => {
        const confirmed = window.confirm("Are you sure you want to delete this interview?")

        if(!confirmed){return}

        const response = await fetch(`http://localhost:8000/interviews/${interviewId}`, {
            method: "DELETE",
            credentials: "include"
        })

        const data = await response.json()

        if(!response.ok){
            setError(data.detail)
            return
        }

        setInterviews(interviews.filter((interview) => interview.id !== interviewId))
    }

    return (
        <div className="history-page">
            <div className="history-container">

                <header className="history-header">
                    <div>
                        <h1>Interview History</h1>
                        <p>Review completed interviews or continue where you left off.</p>
                    </div>

                    <button onClick={() => navigate("/dashboard")} className="secondary-button">
                        Back to Dashboard
                    </button> 
                </header>

                {error && <p className="history-error">{error}</p>}

                {interviews.length == 0 ? (
                    <div className="empty-history">
                        <h2>No interviews yet.</h2>
                        <p>Start your first interview to see it appear here.</p>

                        <button onClick={() => navigate("/interview/setup")}>
                            Start Interview 
                        </button>
                    </div>
                ) : (
                    <div className="history-list">

                        {interviews.map((interview) => (

                            <div className="history-card" key={interview.id}>

                                <div className="history-card-header"> 
                                    <div>
                                        <h2>{interview.role}</h2>
                                        <p>{interview.difficulty} . {interview.interview_type}</p>
                                    </div>

                                    <span 
                                        className={
                                            interview.status === "completed" 
                                            ? "status-badge completed"
                                            : "status-badge in-progress"}>
                                        {interviews.status === "completed" ? "Completed": "In Progress"}
                                    </span>
                                </div>

                                <div className="history-actions">

                                    {interview.status == "completed" ? (
                                        <button onClick={() => navigate(`/interview/${interview.id}/results`)}>
                                            View Results
                                        </button>
                                    ) : (
                                        <button onClick={() => navigate(`/interview/${interview.id}`)}>
                                            Continue Interview
                                        </button>
                                    )}

                                    <button className="secondary-button" onClick={() => handleRestart(interview.id)}>
                                        Restart 
                                    </button>

                                    <button className="delete-button" onClick={() => handleDelete(interview.id)}>
                                        Delete 
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default InterviewHistory