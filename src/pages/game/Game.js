import { Button, Stack, TextField, Divider, Alert, AlertTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTimeoutFn } from "react-use";
import "./Game.css"

function Game() {
    const [username, setUsername] = useState("")
    const [usernameError, setUsernameError] = useState(false)
    const [matchId, setMatchId] = useState("")
    const [matchIdError, setMatchIdError] = useState(false)
    const [message, setMessage] = useState("")
    const navigate = useNavigate();   
    // eslint-disable-next-line no-unused-vars
    const [isReady, cancel, reset] = useTimeoutFn(() => setMessage(""), 5000);
    const usernameRegex = new RegExp("[^A-Za-z0-9]+");
    const matchRegex = new RegExp("[^0-9-]+")
    var domain = "https://agile-brushlands-49713.herokuapp.com"

    const createMatch = async () => {
        await fetch(`${domain}/create`, {method: "POST"})
            .then((response) => response.json())
            .then((response) => setMatchId(response.id.toString()));
    }

    const joinMatch = async () => {
        await fetch(`${domain}/join`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <TextField error={usernameError} id="outlined-basic" label="Username" variant="outlined" value={username} size="small" onChange={(e) => {
                setUsername(e.target.value)
                setUsernameError(e.target.value.match(usernameRegex) !== null)
            }} helperText={username.match(usernameRegex) ? "Use only letters or numbers.": ""} />
            <TextField error={matchIdError} id="outlined-basic" label="Match ID" variant="outlined" value={matchId} size="small" onChange={(e) => {
                setMatchId(e.target.value)
                setMatchIdError(e.target.value.match(matchRegex) !== null)
            }} helperText={matchId.match(matchRegex) ? "Use only numbers.": ""} />
            <Divider orientation="horizontal" flexItem />
            <Button variant="contained" disabled={username === "" || matchId === ""} onClick={() => joinMatch()}>Join</Button>
        </Stack>
        <p className="version">Version E0.0.1I0.0.1FMQ0.0.01G15271.9331RC4.0b</p>
    </div>
  );
}

export default Game;
