import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import YouTube from "react-youtube";
import socket from "../socket";


function VideoPlayer() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [videoId, setVideoId] = useState<string | null>(null);
    const playerRef = useRef<YT.Player | null>(null);

    useEffect(() => {

        socket.emit("get-video", sessionId);
        
        const onLoad = (id: string) => setVideoId(id);
        socket.on("load-order", onLoad);
        socket.on("send-video", onLoad);

        return () => {
            socket.off("load-order");
            socket.off("send-video");
        }
    }, []);

    // react-youtube gives you the real YT player when it’s ready
    const handleReady = (e: { target: YT.Player }) => {
        playerRef.current = e.target;
    };

    // (optional) if you want to request a change from here later:
    // socket.emit("load-request", newId);

    if (!videoId) return <div />; // or a tiny placeholder

    return (
        <YouTube
            videoId={videoId}
            onReady={handleReady}
            opts={{ width: "640", height: "390", playerVars: { autoplay: 0 } }}
        />
    );
}

export default VideoPlayer;