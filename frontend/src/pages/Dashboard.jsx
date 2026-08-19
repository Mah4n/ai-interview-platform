import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [cvFile, setCvFile] = useState(null)
    const [message, setMessage] = useState("")
    const [currentCv, setCurrentCv] = useState(null)

    useEffect( () => {
        const loadDashboard = async () => {
            const profileResponse = await fetch("http://localhost:8000/profile", {
                method: "GET",
                credentials: "include"
            })

            if (profileResponse.ok){
                const data = await profileResponse.json()
                setUser(data)
            }

            const cvResponse = await fetch("http://localhost:8000/cv", {
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
        loadDashboard()
    }, [])

    const getCv = async () => {
            const response = await fetch("http://localhost:8000/cv", {
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

        const response = await fetch("http://localhost:8000/cv/upload", {
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
        await fetch ("http://localhost:8000/logout", {
            method: "POST",
            credentials: "include"
        })
        navigate("/login")
    }

    const handleDeleteCv = async () => {
        const response = await fetch ("http://localhost:8000/cv", {
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
        <div>
            <h1>Dashboard</h1>

            {user ? (
                <div>
                    <p>Welcome, {user.email}</p>
                    <p>User ID: {user.id}</p>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}

            <div> 
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

                <button onClick={handleCvUpload}>
                    {currentCv ? "Replace CV" : "Upload CV"}
                </button>
                
                {message && <p>{message}</p>}
            </div>

            {currentCv && <button onClick={handleDeleteCv}>Delete CV</button> }

            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default Dashboard 