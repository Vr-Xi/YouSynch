import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";

function Watchroom() {
    const { sessionId } = useParams();
    return (
        <div>
            <h1>Watch Room - Session ID: {sessionId}</h1>
            <VideoPlayer />
        </div>
    )
}

export default Watchroom;