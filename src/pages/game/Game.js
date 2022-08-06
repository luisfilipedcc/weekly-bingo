import { Button, Stack, TextField, Divider, Alert, AlertTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTimeoutFn } from "react-use";
import "./Game.css"

function Game() {
    const [username, setUsername] = useState("")
    const [matchId, setMatchId] = useState("")
    const [message, setMessage] = useState("")
    const navigate = useNavigate();   
    const [isReady, cancel, reset] = useTimeoutFn(() => setMessage(""), 5000);

    const createMatch = async () => {
        await fetch("https://agile-brushlands-49713.herokuapp.com/create", {method: "POST"})
            .then((response) => response.json())
            .then((response) => setMatchId(response.id.toString()));
    }

    const joinMatch = async () => {
        await fetch("https://agile-brushlands-49713.herokuapp.com/join", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, matchId})
            })
            .then((response) => {
                if(response.status === 201) {
                    navigate(`/match/${matchId}/${username}`)
                } else {
                    return response.json()
                }
            })
            .then((response) => {
                if(response?.message){
                    setMessage(response.message)
                }
            })
    }

    useEffect(() => {
        if(message !== ""){
            reset()
        }
    }, [message])

    return (
    <div id="Game">
        {message && <Alert severity="error" className="alertJoin">
            <AlertTitle>Error</AlertTitle>
            {message}
        </Alert>}
        <Stack spacing={2} direction="column">
            <Button variant="contained" color="secondary" onClick={() => createMatch()}>Create New</Button>
            <Divider orientation="horizontal" flexItem />
            <TextField id="outlined-basic" label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField id="outlined-basic" label="Match ID" variant="outlined" value={matchId} onChange={(e) => setMatchId(e.target.value)} />
            <Divider orientation="horizontal" flexItem />
            <Button variant="contained" disabled={username === "" || matchId === ""} onClick={() => joinMatch()}>Join</Button>
        </Stack>
        <p className="version">Version E0.0.1I0.0.1FMQ0.0.01G15271.9331RC4.0b</p>
    </div>
  );
}

export default Game;
