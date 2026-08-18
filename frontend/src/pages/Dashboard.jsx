import { useNavigate } from "react-router-dom"

function Dashboard() {
    const naviagte = useNavigate()

    const handleLogout = async () => {
        await fetch ("http://localhost:8000/logout", {
            method: "POST",
            credentials: "include"
        })
        naviagte("/login")
    }

    return(
        <div>
            <h1>Dashboard</h1>
            <p>You are logged in.</p>

            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default Dashboard 