import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

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
        <div>
            <h1>Interview History</h1>

            {error && <p>{error}</p>}

            {interviews.length == 0 ? (
                <p>No interviews completed yet.</p>
            ) : (
                interviews.map((interview) => (
                    <div key={interview.id}> 
                        <h2>{interview.role}</h2>

                        <p>Difficulty: {interview.difficulty}</p>
                        <p>Type: {interview.interview_type}</p>

                        {interview.status == "completed" ? (
                            <button onClick={() => navigate(`/interview/${interview.id}/results`)}>
                                View Results
                            </button>
                        ) : (
                            <button onClick={() => navigate(`/interview/${interview.id}`)}>
                                Continue Interview
                            </button>
                        )}

                        <button onClick={() => handleRestart(interview.id)}>
                            Restart Interview
                        </button>

                        <button onClick={() => handleDelete(interview.id)}>
                            Delete Interview
                        </button>
                    </div>
                ))
            )}
        </div>
    )
}

export default InterviewHistory