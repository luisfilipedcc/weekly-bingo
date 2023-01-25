import { AccountCircle, EmojiEvents, Home, Numbers, Refresh, Wifi, WifiOff } from '@mui/icons-material';
import { Button, Card, CardContent, Grid, List, ListItem, Modal, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMount } from 'react-use';
import happypepe from "./happypepe.png";
import GLOBALS from "../../utils/globals.js";
import "./Match.css"

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#222',
    borderRadius: '10px',
    boxShadow: 24,
    color: '#aaa',
    p: 4,
  };

function Match() {
    const navigate = useNavigate();
    let { id, user } = useParams();
    const [ws, setWs] = useState(null);
    const [refreshed, setRefreshed] = useState(0)
    const [winners, setWinners] = useState([])
    const [words, setWords] = useState([])
    const [localSelected, setLocalSelected] = useState([])
    const [selected, setSelected] = useState([])
    const [messages, setMessages] = useState([])
    const [players, setPlayers] = useState([])
    const [chatMessage, setChatMessage] = useState("")
    const [waitingResponse, setWaitingResponse] = useState(false)
    const [connected, setConnected] = useState(false)

    useMount(() => {
        wsConnect()
    })

    const wsConnect = () => {
        var webSocket = new WebSocket(`wss://${GLOBALS.domain}/${id}/${user}`, 'echo-protocol')
        setWs(webSocket);
        webSocket.onopen = () => {
            console.log('socket connection opened properly');
            setConnected(true)
        };
       
        webSocket.onmessage = (evt) => {
            var data = evt.data;
            var jsonData = JSON.parse(data);
            switch(jsonData.communication) {
                case "message":
                    setMessages((m) => [jsonData.message, ...m])
                    break;
                case "play":
                    setSelected(jsonData.selected);
                    if (jsonData.player === user){
                        setWaitingResponse(false)
                    }
                    break;
                case "prizes":
                    setWinners((m) => [...m, jsonData.info]);
                    break;
                case "connection":
                    setRefreshed(jsonData.refreshed)
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
                    break;
                case "refreshed":
                    setRefreshed(jsonData.refreshed)
                    setWords(jsonData.words)
                default:
                    // nothing to do here
            }
        };
       
        webSocket.onclose = () => {
            // websocket is closed.
            console.log("Connection closed...");
            setConnected(false)
            setTimeout(function() {
                wsConnect();
            }, 1000);
        };

        webSocket.onerror = function(err) {
            setConnected(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected])

    const handleClose = () => {
        navigate("/")
    }

    const sendChatMessage = () => {
        ws.send(JSON.stringify({type: "message", data: {message: chatMessage}}))
        setChatMessage("")
    }

    const refreshWords = () => {
        ws.send(JSON.stringify({type: "refresh"}))
        setRefreshed(num => num + 1)
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
                            <Home sx={{ color: '#aaa', mr: 1, my: 0.5, cursor: "pointer" }} onClick={handleClose} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {connected ? <Wifi sx={{color: '#188739', mr: 1, my: 0.5}}></Wifi> : <WifiOff sx={{color: '#d32f2f', mr: 1, my: 0.5}}></WifiOff>}
                            <AccountCircle sx={{ color: '#aaa', mr: 1, my: 0.5 }} />
                            <span>{user}</span>
                        </Box>
                    </div>
                </Box>
                <Box className="explanation">
                    <span className="explanation-words">words</span> / <span className="explanation-lines">lines</span> / <span className="explanation-bingo">bingo</span>
                </Box>
                <Box id="HeaderRanking">
                    {players.map((e, index) => {
                        return (<Card key={`player-${index}`} className="ranking-cards">
                                <CardContent className="ranking-info"><span>{e.player}</span>
                                    <div>
                                        <span className="explanation-words">{e.words.reduce((a, c) => a + selected.includes(c), 0)}</span> / <span className="explanation-lines">{winners.filter((w) => w.player === e.player && w.patterns.line).length}</span> / <span className="explanation-bingo">{winners.filter((w) => w.player === e.player && w.patterns.bingo).length}</span>
                                    </div>
                                </CardContent>
                            </Card>)
                    })}
                </Box>
            </div>
            <div className='bingo-wrapper'>
                <Grid id="Bingo" container spacing={0.5}>
                    {words.map((word) => 
                        <Grid key={"grid_" + word.value} item xs={3} md={3} className="gridItem">
                            <Button key={"button_" + word.value} variant={word.selected ? "contained" :"outlined"} color="error" onClick={() => selectWord(word.value)} disabled={localSelected.includes(word) || waitingResponse}>{word.value}</Button>
                        </Grid>
                    )}
                </Grid>
                {words.length > 0 && <div className="refresh-words-wrapper">
                    <Button id="RefreshWords" onClick={refreshWords} variant={"outlined"} disabled={refreshed < 0}><Refresh className="prepend-icon" /> Refresh Words ({refreshed}/1)</Button>
                </div>}
            </div>
            <div className="feed-wrapper">
                <Card className="feed">
                    <CardContent className="messages">
                        {messages.map((message, index) => {
                            if(message.type === "message"){
                                return (<span key={`message-${index}`} className="chat-message"><span className="chat-message-user">{message.user}:</span><span>{message.message}</span></span>)
                            }
                            if(message.type === "selection"){
                                return (<span key={`message-${index}`} className="chat-message-selected-word"><span className="chat-message-user">{message.user}:</span><span><i>selected "{message.selected}"</i></span></span>)
                            }
                            if(message.type === "prize"){
                                return (<span key={`message-${index}`} className="chat-message-prize-line"><span className="chat-message-user">{message.user}:</span><span><i>{message.prize} pattern</i></span></span>)
                            }
                            if(message.type === "refreshed"){
                                return (<span key={`message-${index}`} className="chat-message-refreshed"><span className="chat-message-user">{message.user}:</span><span><i>refreshed his/her card</i></span></span>)
                            }
                            return null
                        })}
                    </CardContent>
                    <CardContent className="input-chat">
                        <TextField id="chat-input" label="chat" variant="outlined" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={handleKeyDown} size="small"/>
                        <Button id="chat-input-send" onClick={sendChatMessage} disabled={chatMessage === ""} variant={"contained"}>Send</Button>
                    </CardContent>
                </Card>
            </div>
            <Modal open={winners.filter((w) => w.patterns.bingo).length !== 0}>
                <Box sx={modalStyle}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                    <div id="MatchWinnerTitle"><img className="frog" src={happypepe} alt="frog"></img>Winners</div>
                    </Typography>
                    <List id="modal-modal-description" sx={{ mt: 2 }}>
                        {winners.filter((winner) => winner.patterns.bingo).map((winner, index) => <ListItem key={`winner-${index}`}>{winner.player}</ListItem>)}
                    </List>
                    <br />
                    <Button id="ExitMatchButton" onClick={handleClose} variant={"contained"}>Exit Match</Button>
                </Box>
            </Modal>
        </div>
    );
}

export default Match;
