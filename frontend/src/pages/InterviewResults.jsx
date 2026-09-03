import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./InterviewResults.css"

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
        <div className="results-page">
            <div className="results-container">

                <header className="results-header">
                    <div>
                        <h1>Interview Complete</h1>
                        <p>{interview.role} . {interview.difficulty} . {interview.interview_type}</p>
                    </div>

                    <div className="overall-score">
                        <span>{avgScore.toFixed(1)}</span>
                        <p>Overall / 10</p>
                    </div>
                </header>

                <section className="results-summary">
                    <div>
                        <span className="summary-number">{interview.responses.length}</span>
                        <span className="summary-label">Questions Answered</span>
                    </div>

                    <div>
                        <span className="summary-number">
                            {Math.max(...interview.responses.map(response => response.score))}
                        </span>
                        <span className="summary-label">Highest score</span>
                    </div>
                </section>

                <h2 className="feedback-title">Question Feedback</h2>

                <div className="results-list">
                    {interview.responses.map((response) => (
                        <div className="result-card" key={response.question_index}>

                            <div className="result-card-header">
                                <span>Question {response.question_index + 1}</span>
                                <span className="result-score">{response.score}/10</span>
                            </div>

                            <h3>{response.question}</h3>

                            <div className="result-section">
                                <h4>Your Answer</h4> 
                                <p>{response.answer}</p>
                            </div>

                           <div className="result-section">
                                <h4>Strengths</h4> 
                                <p>{response.strengths}</p>
                            </div>

                            <div className="result-section">
                                <h4>Areas to Improve</h4> 
                                <p>{response.weaknesses}</p>
                            </div>

                            <div className="result-section">
                                <h4>Suggested improvement</h4>
                                <p>{response.suggested_improvement}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="results-actions">
                    <button onClick={() => navigate("/history")}>
                        Interview History
                    </button>

                    <button className="secondary-button" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InterviewResults