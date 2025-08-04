import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { useState } from "react";
import "../styles/Watchroom.css";

function Watchroom() {
    const { sessionId } = useParams();
    const [ vidUrl, setUrl ] = useState("");
    const [ video, setVideo] = useState<string>("");
    
    const handleLink = (event: React.FormEvent) => {
        event.preventDefault();
        setVideo(extractVidId(vidUrl));
        console.log(video);
    };
    const extractVidId = (url: string): string => {
        let result;
        if (url.length < 24) {
            result = url;
        } else {
            if (url.substring(0, 23) === "www.youtube.com/watch?v=") {
                result = url.substring(24, url.length)
            } else if (url.substring(0, 32) === "https://www.youtube.com/watch?v=") {
                result = url.substring(32, url.length)
            } else {
                result = url;
            }
        }
        // const match = url.match(/v=([^&]+)/);
        // return match ? match[1] : "";
        console.log("Expecting ID to be: " + result);
        return result.split("&")[0];

    }
    return (
        <div>
            <h1>Watch Room - Session ID: {sessionId}</h1>
            <form onSubmit={handleLink}>
                <input 
                    id="link" 
                    type="text" 
                    placeholder="Paste your YouTube link here"
                    onChange={(event) => setUrl(event.target.value)}/>
                <button type="submit">Send</button>
            </form>
            <VideoPlayer video={video}/>
        </div>
    )
}

export default Watchroom;