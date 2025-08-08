import { useState, useEffect, useRef } from "react";
import socket from "../socket";

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
    }
};

type Props = {
    video: string;
};

function VideoPlayer({ video }: Props) {
    const playerRef = useRef<HTMLDivElement | null>(null);
    const playerInstance = useRef<YT.Player | null>(null);
    const [ videoStorage, changeVideo ] = useState<string>(video);    

    useEffect(() => {
        const onYouTubeIframeAPIReady = () => {
            if (!playerRef.current) return;
            playerInstance.current = new window.YT.Player(playerRef.current, {
                height: "390",
                width: "640",
                videoId: "2H0r81kv5GA",
                events: {
                    onReady: () => console.log("Player ready."),
                    onStateChange: (event: YT.OnStateChangeEvent) => console.log("State change", event.data),
                },
            });
        };

        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
            document.body.appendChild(tag);
        } else {
            onYouTubeIframeAPIReady();
        }

        socket.on("load-order", (toLoad: string) => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            changeVideo(toLoad);
        })

        return () => {
            socket.off("load-order");
        };

    }, []);

    useEffect(() => {
        if (playerInstance.current && videoStorage !== "") {
            playerInstance.current.loadVideoById(videoStorage);
            socket.emit("load-request", videoStorage)
        }
    }, [videoStorage]);

    useEffect(() => {
        changeVideo(video);
    }, [video]);


    return <div ref={playerRef}></div>
};

export default VideoPlayer;