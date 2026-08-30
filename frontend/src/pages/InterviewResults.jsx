import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function InterviewResults() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [interview, setInterview] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        const getInterview = async () => {
            try {
                const response = await fetch(`http://localhost:8000/interviews/${id}`, {
                    method: "GET",
                    credentials: "include"
                })

                const data = await response.json()

                if(!response.ok){
                    setError(data.detail)
                    return
                }

                setInterview(data)
            } catch (error) {
                console.error(error)
                setError("Could not load interview results.")
            }
        }

        getInterview()
    }, [id])

    if (error){
        return <p>{error}</p>
    }

    if (!interview){
        return <p>Loading results...</p>
    }

    const scores = interview.responses.map((response) => response.score)

    const avgScore = scores.length > 0 
        ? scores.reduce((total, score) => total+score, 0) / scores.length 
        : 0

    return (
        <div>
            <h1>Interview Complete</h1>

            <p>Role: {interview.role}</p>
            <p>Difficulty: {interview.difficulty}</p>
            <p>Type: {interview.interview_type}</p>

            <h2>Overall Score: {avgScore.toFixed(1)}/10</h2>

            <h2>Question Feedback</h2>

            {interview.responses.map((response) => (
                <div key={response.question_index}>
                <h3>
                    Question {response.question_index + 1}
                </h3>

                <p>{response.question}</p>

                <p>
                    <strong>Your answer:</strong> {response.answer}
                </p>

                <p>
                    <strong>Score:</strong> {response.score}/10
                </p>

                <p>
                    <strong>Strengths:</strong> {response.strengths}
                </p>

                <p>
                    <strong>Weaknesses:</strong> {response.weaknesses}
                </p>

                <p>
                    <strong>Suggested improvement:</strong>{" "}
                    {response.suggested_improvement}
                </p>
                </div>
            ))}

            <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
    )
}

export default InterviewResults