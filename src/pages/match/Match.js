import { AccountCircle, EmojiEvents, Numbers } from '@mui/icons-material';
import { Button, Grid, List, ListItem, Modal, TextField, Typography } from '@mui/material';
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
    const [localSelected, setLocalSelected] = useState([])
    const [selected, setSelected] = useState([])
    const [messages, setMessages] = useState([])
    const [players, setPlayers] = useState([])
    const [chatMessage, setChatMessage] = useState("")
    const [waitingResponse, setWaitingResponse] = useState(false)

    useMount(() => {
        wsConnect()
    })

    const wsConnect = () => {
        var webSocket = new WebSocket(`wss://agile-brushlands-49713.herokuapp.com/${id}/${user}`, 'echo-protocol')
        setWs(webSocket);
        webSocket.onopen = () => {
            console.log('socket connection opened properly');
        };
       
        webSocket.onmessage = (evt) => {
            var data = evt.data;
            var jsonData = JSON.parse(data);
            switch(jsonData.communication) {
                case "message":
                    setMessages((m) => [jsonData.message, ...m])
                    break;
                case "play":
                    setWinners(jsonData.winners);
                    setSelected(jsonData.selected);
                    if (jsonData.player === user){
                        setWaitingResponse(false)
                    }
                    break;
                case "connection":
                    setWords(jsonData.words)
                    setWinners(jsonData.winners)
                    if(jsonData.players){
                        setPlayers(jsonData.players)
                    }
                    if(jsonData.messages){
                        setMessages(jsonData.messages.reverse())
                    }
                    setSelected(jsonData.selected)
                    break;
                case "joined":
                    setPlayers(jsonData.players)
                default:
                    // nothing to do here
            }
        };
       
        webSocket.onclose = () => {
            // websocket is closed.
            console.log("Connection closed...");
            setTimeout(function() {
                wsConnect();
            }, 1000);
        };

        webSocket.onerror = function(err) {
            console.error('Socket encountered error: ', err.message, 'Closing socket');
            webSocket.close();
        };
    }

    const selectWord = (word) => {
        setLocalSelected((e) => [...e, word])
        if(!selected.includes(word)){
            setWaitingResponse(true)
            ws.send(JSON.stringify({type: "play", data: {selected: word}}))
        }
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

    const sendChatMessage = () => {
        ws.send(JSON.stringify({type: "message", data: {message: chatMessage}}))
        setChatMessage("")
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendChatMessage()
        }
    }

    return (
        <div id="Match">
            <div id="HeaderWrapper">
                <Box id="HeaderInnerWrapper" sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", padding: "10px"}}>
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
                <Box id="HeaderRanking">
                    {players.map((e, index) => {
                        return (<div key={`player-${index}`} className="rank-wrapper"><div className="rank-user">{e.player}</div><div className="rank-words">{e.words.reduce((a, c) => a + selected.includes(c), 0)}</div></div>)
                    })}
                </Box>
            </div>
            <Grid id="Bingo" container spacing={3}>
                {words.map((word) => 
                    <Grid key={"grid_" + word.value} item xs={4} md={3} className="gridItem">
                        <Button key={"button_" + word.value} variant={word.selected ? "contained" :"outlined"} color="error" onClick={() => selectWord(word.value)} disabled={localSelected.includes(word) || waitingResponse}>{word.value}</Button>
                    </Grid>
                )}
            </Grid>
            <div>
            </div>
            <div className="feed">
                <div className="messages">
                    {messages.map((message, index) => {
                        if(message.type === "message"){
                            return (<span key={`message-${index}`}>{message.user}: {message.message}</span>)
                        }
                        if(message.type === "selection"){
                            return (<span key={`message-${index}`} className="chat-message-selected-word">User {message.user} selected {message.selected}</span>)
                        }
                    })}
                </div>
                <div className="input-chat">
                    <TextField id="chat-input" label="chat" variant="outlined" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={handleKeyDown}/>
                    <Button id="chat-input-send" onClick={sendChatMessage} disabled={chatMessage === ""} variant={"contained"}>Send</Button>
                </div>
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
