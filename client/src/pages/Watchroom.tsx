/* eslint-disable react-hooks/exhaustive-deps */
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { useState, useEffect } from "react";
import socket from "../socket";
import "../styles/Watchroom.css";

function Watchroom() {
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const [ vidUrl, setUrl ] = useState("");
    const [ video, setVideo] = useState<string>("");
    const [ memberEntries, setMemberNames ] = useState<[string, string][]>([]);
    const [ nickname, setNickname ] = useState<string>("");
    
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
        return result.split("&")[0];
    
    }


    useEffect(() => {
        socket.emit("join-session", sessionId);
        socket.emit("fetch-members", sessionId);
        socket.emit("fetch-nickname");

        socket.on("session-invalid", () => {
            navigate("/", { state: { error: "You tried to join a session that does not exist."} });
        });
        socket.on("send-members", (members: []) => {
            setMemberNames(members);
        });

        socket.on("send-nickname", (fetchedNickname) => {
            const oldNickname = sessionStorage.getItem("nickname");
            const oldSession = sessionStorage.getItem("session");
            if (oldNickname && oldSession) {
                if ( oldSession === sessionId ) {
                    setNickname(oldNickname);
                    socket.emit("change-nickname", oldNickname);
                } else {
                    setNickname(fetchedNickname);
                    sessionStorage.setItem("nickname", fetchedNickname);
                    sessionStorage.setItem("session", sessionId ? sessionId : "");
                }
            } else {
                setNickname(fetchedNickname);
                sessionStorage.setItem("nickname", fetchedNickname);
                sessionStorage.setItem("session", sessionId ? sessionId : "");
            }
        })

        return () => {
            socket.off("session-invalid");
            socket.off("send-members");
            socket.off("leave-session");
            socket.off("send-nickname");
            socket.emit("leave-session");  
        };
    },  []);

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
            <ul>
                {memberEntries.map((entry: [string, string]) => {
                    return <li key={entry[0]}>{entry[1]}</li>
                })}
            </ul>

        </div>
    )
}

export default Watchroom;