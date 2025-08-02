import { useParams } from "react-router-dom"

function Watchroom() {
    const { sessionId } = useParams();
    return <h1>Watch Room - Session ID: {sessionId}</h1>
}

export default Watchroom;