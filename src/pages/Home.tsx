import * as rrd from "react-router-dom";

function Home() {
    const navigate = rrd.useNavigate();

    const join = () => {
        navigate("/watch/test123");
    }
    // const createRoom = () => {
    //     const randomId: string = Math.random().toString(36).substring(2, 8);
    //     navigate(`/watch/${randomId}`);
    // }
    return (
        <div>
            <h1>Home - Create or join a session</h1>
            <button>Create Session</button>
            <button onClick={join}>Join Session</button>
        </div>
    );
}

export default Home;