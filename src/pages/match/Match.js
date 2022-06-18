import { AccountCircle, EmojiEvents, Numbers } from '@mui/icons-material';
import { Button, Grid, List, ListItem, Modal, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMount } from 'react-use';
import frog from "./frog.png";
import "./Match.css"

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#ddd',
    border: '2px solid #000',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
  };

function Match() {
    const navigate = useNavigate();
    let { id, user } = useParams();
    const [ws, setWs] = useState(null);
    const [winners, setWinners] = useState([])
    const [words, setWords] = useState([])
    const [selected, setSelected] = useState([])
    const [picked, setPicked] = useState([])

    useMount(() => {
        var webSocket = new WebSocket(`ws://localhost:3001/${id}/${user}`, 'echo-protocol')
        setWs(webSocket);
        webSocket.onopen = () => {
            console.log('socket connection opened properly');
        };
       
        webSocket.onmessage = (evt) => {
            var data = evt.data;
            var jsonData = JSON.parse(data);
            if(jsonData.words) {
                setWords(jsonData.words);
            }
            if(jsonData.winners) {
                setWinners(jsonData.winners);
            }
            if(jsonData.selected) {
                setSelected(jsonData.selected);
            }
            if(jsonData.picked){
                setPicked((p) => [jsonData, ...p])
            }
        };
       
        webSocket.onclose = () => {
            // websocket is closed.
            console.log("Connection closed...");
        };
    })

    const selectWord = (word) => {
        ws.send(JSON.stringify({selected: word}))
    }

    useEffect(() => {
        if(selected !== []) {
            var newWords = words.map((w) => {
                return {
                    value: w.value,
                    selected: selected.includes(w.value)
                }
            })
            setWords(newWords);
        }
    }, [selected])

    const handleClose = () => {
        navigate("/")
    }

    return (
        <div id="Match">
            <Box id="HeaderWrapper" sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", padding: "10px"}}>
                <div id="Header">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Numbers sx={{ color: '#aaa', mr: 1, my: 0.5 }} />
                        <span>{id}</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountCircle sx={{ color: '#aaa', mr: 1, my: 0.5 }} />
                        <span>{user}</span>
                    </Box>
                </div>
            </Box>
            <Grid id="Bingo" container spacing={3}>
                {words.map((word) => 
                    <Grid key={"grid_" + word.value} item xs={4} md={3} className="gridItem">
                        <Button key={"button_" + word.value} variant={word.selected ? "contained" :"outlined"} color="error" onClick={() => selectWord(word.value)}>{word.value}</Button>
                    </Grid>
                )}
            </Grid>
            <div>
            </div>
            <div className="feed">
                {picked.map((p) => <div key={`${p.picked}_${p.user}`}><b>{p.picked}</b> was selected by <b>{p.user}</b></div>)}
            </div>
            <Modal open={winners.length !== 0}>
                <Box sx={modalStyle}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                    <div id="MatchWinnerTitle"><EmojiEvents sx={{ mr: 1, my: 0.5 }} /> We have a winner</div>
                    </Typography>
                    <List id="modal-modal-description" sx={{ mt: 2 }}>
                        {winners.map((winner) => <ListItem key={"winner_" + winner}><img className="frog" src={frog}></img>{winner}</ListItem>)}
                    </List>
                    <br />
                    <Button id="ExitMatchButton" onClick={handleClose} variant={"contained"}>Exit Match</Button>
                </Box>
            </Modal>
        </div>
    );
}

export default Match;
