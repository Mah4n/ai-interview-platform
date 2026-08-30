import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

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
        } catch (error) {
            console.error(error)
            setError("Could not load interview.")
        }
        }
        getInterview()
    }, [id])

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
        <div>
            <h1>Interview</h1>
            <p>Interview ID: {id}</p>

            {error && <p>{error}</p>}

            {!interview ? (
                <p>Loading interview...</p>
            ) : (
                <div>
                    <p>{currentQuestion+1} of {interview.questions.length}</p>
                    <h2>{interview.questions[currentQuestion]}</h2>
                </div>
            )}

            <textarea 
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer here..."
            />

            <button onClick={handleSubmitAnswer} disabled={submitting || feedback}>
                {submitting ? "Evaluating..." : "Submit Answer"}
            </button>

            {feedback && (
                <div>
                    <h3>Feedback</h3>
                    <p>Score: {feedback.score}/10</p>
                    <p><strong>Strengths:</strong>{feedback.strengths}</p>
                    <p><strong>Weaknesses:</strong>{feedback.weaknesses}</p>
                    <p><strong>Suggested improvement:</strong>{" "}{feedback.suggested_improvement}</p>
                </div>
            )}

            {feedback && (
                currentQuestion < interview.questions.length-1 ? (
                <button onClick={handleNextQuestion}>Next Question</button>
            ) : (
                <button onClick={handleFinishInterview}>Finish Interview</button>
            ))}
        </div>
    )  
}

export default Interview