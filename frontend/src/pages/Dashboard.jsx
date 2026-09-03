import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config"
import "./Dashboard.css"

function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [cvFile, setCvFile] = useState(null)
    const [message, setMessage] = useState("")
    const [currentCv, setCurrentCv] = useState(null)
    const [analytics, setAnalytics] = useState(null)

    useEffect( () => {
        const loadDashboard = async () => {
            const profileResponse = await fetch(`${API_URL}/profile`, {
                method: "GET",
                credentials: "include"
            })

            if (profileResponse.ok){
                const data = await profileResponse.json()
                setUser(data)
            }

            const cvResponse = await fetch(`${API_URL}/cv`, {
                method: "GET",
                credentials: "include"
            })

            if(cvResponse.ok){
                const data = await cvResponse.json()
                setCurrentCv(data)
            } else if (cvResponse.status === 404){
                setCurrentCv(null)
            }
        }

        const getAnalytics = async () => {
            try {
                const response = await fetch(`${API_URL}/analytics`, {
                    method: "GET",
                    credentials: "include"
                })

                const data = await response.json()

                if(!response.ok){
                    console.error(data.detail)
                    return 
                }

                setAnalytics(data)
            } catch (error) {
                console.error(error)
            }
        }

        loadDashboard()
        getAnalytics()
    }, [])

    const getCv = async () => {
            const response = await fetch(`${API_URL}/cv`, {
                method: "GET",
                credentials: "include"
            })

            if(response.ok){
                const data = await response.json()
                setCurrentCv(data)
            } else if (response.status === 404){
                setCurrentCv(null)
            }
        }

    const handleCvUpload = async () => {
        if (!cvFile) {
            setMessage("Please select a PDF first.")
            return 
        }

        const formData = new FormData()
        formData.append("file", cvFile)

        const response = await fetch(`${API_URL}/cv/upload`, {
            method: "POST",
            credentials: "include",
            body: formData
        })

        const data = await response.json()

        if(!response.ok){
            setMessage(data.detail)
            return
        }   
        setMessage(data.message)
        await getCv()
    }

    const handleLogout = async () => {
        await fetch (`${API_URL}/logout`, {
            method: "POST",
            credentials: "include"
        })
        navigate("/login")
    }

    const handleDeleteCv = async () => {
        const response = await fetch (`${API_URL}/cv`, {
            method: "DELETE",
            credentials: "include"
        })

        const data = await response.json()
        
        if (!response.ok){
            setMessage(data.detail)
            return
        }

        setMessage(data.message)
        setCurrentCv(null)
        setCvFile(null)
    }

    return(
        <div className="dashboard-page">

            <header className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    {user ? (
                        <p>Welcome, {user.email}</p>
                    ) : (
                        <p>Loading profile...</p>
                    )}
                </div>

                <button onClick={handleLogout}>Logout</button>
            </header>


            <section className="dashboard-grid">

                <div className="dashboard-card">
                    <h2>Start Interview</h2>
                    <p>Generate a tailored interview based on your CV and chosen role.</p>
                    <button onClick={() => navigate("/interview/setup")}>Start Interview</button>
                </div>


                <div className="dashboard-card">
                    <h2>Interview History</h2>
                    <p>View previous interviews or continue an unfinished one.</p>
                    <button onClick={() => navigate("/history")}>Interview History</button>
                </div>


                <div className="dashboard-card"> 
                    <h2>Your CV</h2>
                    {currentCv ? (
                        <div>
                            <p>Current CV: {currentCv.original_filename}</p>
                            <p>Uploaded: {new Date(currentCv.uploaded_at).toLocaleDateString()}</p>
                        </div>
                    ) : (
                        <p>No CV uploaded yet.</p>
                    )}

                    <input 
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => setCvFile(event.target.files[0])}/>

                    <div className="cv-actions">
                        <button onClick={handleCvUpload}>
                            {currentCv ? "Replace CV" : "Upload CV"}
                        </button>
                        
                        {currentCv && <button onClick={handleDeleteCv}>Delete CV</button> }
                    </div>
                </div>


                <div className="dashboard-card">
                    <h2>Your Progress</h2>
                    {analytics ? (
                        analytics.interviews_completed > 0 ? (
                            <div className="analytics-grid">

                                <div className="analytics-stat">
                                    <span className="analytics-number">{analytics.interviews_completed}</span>
                                    <span className="analytics-label">Interviews</span>
                                </div>

                                <div className="analytics-stat">
                                    <span className="analytics-number">{analytics.questions_answered}</span>
                                    <span className="analytics-label">Questions</span>
                                </div>

                                <div className="analytics-stat">
                                    <span className="analytics-number">{analytics.average_score.toFixed(1)}</span>
                                    <span className="analytics-label">Average / 10</span>
                                </div>

                                <div className="analytics-stat">
                                    <span className="analytics-number">{analytics.highest_score.toFixed(1)}</span>
                                    <span className="analytics-label">Highest / 10</span>
                                </div>
                    
                            </div>
                        ) : (
                            <p>Complete your first interview to see your performance.</p>
                        ) 
                    ) :(
                        <p>Loading analytics...</p>
                    )}
                </div>


            </section>
            {message && <p>{message}</p>}
        </div>
    )
}

export default Dashboard 