/* eslint-disable react-hooks/exhaustive-deps */
import * as rrd from "react-router-dom";
import socket from "../socket";
import { useEffect } from "react";

function Home() {
    const navigate = rrd.useNavigate();
    const location = rrd.useLocation();

    const error = location.state?.error;
    const errorCheck = location.state?.show;

    const join = () => {
        navigate("/watch/test123");
    }
    const create = () => {
        if (socket.connected) {
            socket.emit("create-session");
        } else {
            console.log("Socket not connected yet.");
        }
    };

    useEffect(() => {
        socket.on("session-created", (sessionId: string) => {
            navigate(`/watch/${sessionId}`);
        });

        if (errorCheck === 0) {
            navigate(".", { replace: true, state: null });
        } else if (errorCheck === 1) {
            navigate(".", { replace: true, state: {
                error: error,
                show: 0,
                }
            });
        }

        return () => {
            socket.off("session-created");
        }

    }, []);

    return (
        <div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h1>Home - Create or join a session</h1>
            <button onClick={create}>Create Session</button>
            <button onClick={join}>Join Session</button>
        </div>
    );
}

export default Home;