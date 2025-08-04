import { useEffect, useRef } from "react";

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
    }
}

type Props = {
    video: string;
};

function VideoPlayer({ video }: Props) {
    const playerRef = useRef<HTMLDivElement | null>(null);
    const playerInstance = useRef<YT.Player | null>(null);    

    useEffect(() => {
        const onYouTubeIframeAPIReady = () => {
            if (!playerRef.current) return;
            playerInstance.current = new window.YT.Player(playerRef.current, {
                height: "390",
                width: "640",
                videoId: "2H0r81kv5GA",
                events: {
                    onReady: () => console.log("Player ready"),
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
    }, []);

    useEffect(() => {
        if (playerInstance.current && video !== "") {
            playerInstance.current.loadVideoById(video);
        }
    }, [video]);


    return <div ref={playerRef}></div>
};

export default VideoPlayer;