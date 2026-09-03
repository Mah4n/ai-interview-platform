import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./Interview.css"

function Interview(){
    const navigate = useNavigate()
    const { id } = useParams()
    const [interview, setInterview] = useState(null)
    const [error, setError] = useState("")
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answer, setAnswer] = useState("")
    const [feedback, setFeedback] = useState(null)
    const [submitting, setSubmitting] = useState(false)

useEffect(() => {
    const getInterview = async () => {
        try{
            const response = await fetch(`http://localhost:8000/interviews/${id}`, {
                method: "GET",
                credentials: "include"}
            )

            const data = await response.json()

            if(!response.ok){
                setError(data.detail)
                return
            }

            setInterview(data)

            if (data.status === "completed") {
                navigate(`/interview/${id}/results`)
                return
            }

            setCurrentQuestion(data.current_question_index)
        } catch (error) {
            console.error(error)
            setError("Could not load interview.")
        }
        }
        getInterview()
    }, [id, navigate])

    const handleSubmitAnswer = async () => {
        if(!answer.trim()){
            setError("Please enter an answer before submitting.")
            return
        }

        setError("")
        setSubmitting(true)

        try {
            const response = await fetch("http://localhost:8000/interviews/answer", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    interview_id: Number(id),
                    question_index: currentQuestion, 
                    answer: answer
                })
            })

            const data = await response.json()

            if(!response.ok){
                setError(data.detail)
                return
            }

            setFeedback(data)
        } catch (error) {
            console.error(error)
            setError("Could not submit answer.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleNextQuestion = () => {
        setCurrentQuestion(currentQuestion+1)
        setAnswer("")
        setFeedback(null)
        setError("")
    }

    const handleFinishInterview = () => {
        navigate(`/interview/${id}/results`)
    }

    return (
        <div className="interview-page">

            {error && <p className="interview-error">{error}</p>}

            {!interview ? (
                <p>Loading interview...</p>
            ) : (
                <div className="interview-container">

                    <header className="interview-header">
                    <div>
                        <h1>{interview.role}</h1>
                        <p>{interview.difficulty} · {interview.interview_type}</p>
                    </div>

                    <span className="question-count">
                        Question {currentQuestion + 1} of {interview.questions.length}
                    </span>
                    </header>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{width: `${((currentQuestion + 1) / interview.questions.length) * 100}%`}}/>
                        </div>

                    <main className="question-card">
                        <p className="question-label">Question {currentQuestion + 1}</p>

                        <h2>{interview.questions[currentQuestion]}</h2>

                        <label htmlFor="answer">Your Answer</label>

                        <textarea
                            id="answer"
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            placeholder="Type your answer here..."
                            disabled={feedback !== null}/>

                        {!feedback && (
                            <button onClick={handleSubmitAnswer} disabled={submitting}>
                            {submitting ? "Evaluating..." : "Submit Answer"}
                            </button>
                        )}

                        {feedback && (
                            <div className="feedback-section">

                                <div className="feedback-header">
                                    <h3>AI Feedback</h3>
                                    <span className="score">
                                    {feedback.score}/10
                                    </span>
                                </div>

                                <div className="feedback-item">
                                    <h4>Strengths</h4>
                                    <p>{feedback.strengths}</p>
                                </div>

                                <div className="feedback-item">
                                    <h4>Areas to Improve</h4>
                                    <p>{feedback.weaknesses}</p>
                                </div>

                                <div className="feedback-item">
                                    <h4>Suggested Improvement</h4>
                                    <p>{feedback.suggested_improvement}</p>
                                </div>

                                {currentQuestion < interview.questions.length - 1 ? (
                                    <button onClick={handleNextQuestion}>Next Question</button>
                                ) : (
                                    <button onClick={handleFinishInterview}>Finish Interview</button>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            )}
        </div>
    )
}

export default Interview