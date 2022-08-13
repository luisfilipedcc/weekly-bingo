import { Check, Home } from "@mui/icons-material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMount, useTimeoutFn } from "react-use";
import GLOBALS from "../../utils/globals";
import "./Admin.css"

function Admin() {
    const navigate = useNavigate();
    const [words, setWords] = useState([])
    const [loading, setLoading] = useState(false)
    const [wordsSuccess, setWordsSuccess] = useState(false)
    const [cleanSuccess, setCleanSuccess] = useState(false)
    const [isReadyWordsSuccess, cancelWordsSuccess, resetWordsSuccess] = useTimeoutFn(function() {
        setWordsSuccess(false)
    }, 2000);
    const [isReadyCleanSuccess, cancelCleanSuccess, resetCleanSuccess] = useTimeoutFn(function() {
        setCleanSuccess(false)
    }, 2000);
    var domain = `https://${GLOBALS.domain}`

    useMount(async () => {
        fetchWords()
    })

    const fetchWords = async () => {
        setLoading(true)
        await fetch(`${domain}/words`, {method: "GET"})
            .then((response) => response.json())
            .then((response) => {
                setLoading(false)
                setWords(response.words)
            })
            .catch(err => {
                console.log(err);
                setLoading(false)
                return
            });
    }

    const handleClose = () => {
        navigate("/")
    }

    const removeWord = (index) => {
        setWords(ws => ws.filter((w, i) => i !== index))
    }

    const updateWord = (event, index) => {
        const newWords = [...words]
        newWords[index] = event.target.value;
        setWords(newWords)
    }

    const submitNewList = async () => {
        setLoading(true)
        await fetch(`${domain}/words`, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({words})
        })
        .then((response) => response.json())
        .then(() => {
            setWordsSuccess(true)
            resetWordsSuccess()
            fetchWords()
        })
        .catch(err => {
            console.log(err);
            setLoading(false)
            return
        })
    }

    const cleanMatches = async () => {
        setLoading(true)
        await fetch(`${domain}/cleanDB`, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then((response) => response.json())
        .then(() => {
            setCleanSuccess(true)
            resetCleanSuccess()
            setLoading(false)
        })
        .catch(err => {
            console.log(err);
            setLoading(false)
            return
        })
    }

    return (
        <div id="Admin">
            <div id="HeaderWrapper">
                <Box id="HeaderInnerWrapper" sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", padding: "10px"}}>
                    <div id="Header">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Home sx={{ color: '#aaa', mr: 1, my: 0.5, cursor: "pointer" }} onClick={handleClose} />
                        </Box>
                    </div>
                </Box>
            </div>
            <Container>
                <div id="AccordionsWrapper">
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Update Words</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {words.length > 0 && <Box id="UpdateWords">
                                <Grid container spacing={2}>
                                    {words.map((word, index) => {
                                        return (
                                        <Grid key={`word-input-${index}`} item xs={4}>
                                            <TextField id="outlined-basic" variant="outlined" className="word-field" value={word} onChange={(e) => updateWord(e, index)}/>
                                            <Button color="error" onClick={() => removeWord(index)}>Remove</Button>
                                        </Grid>)
                                    })}
                                    <Grid item xs={4}>
                                        <Button variant="outlined" className="word-add-field" onClick={() => setWords((ws) => [...ws, ""])}>Add Field</Button>
                                    </Grid>
                                </Grid>
                                <div id="SubmitNewWordsWrapper">
                                    <Button id="SubmitNewWords" variant="contained" color="secondary" disabled={(words.some(w => w === "") || words.length < 30) || loading} onClick={() => submitNewList()}>Submit new list{wordsSuccess && <Check className="button-check"></Check>}</Button>
                                </div>
                            </Box>}
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                        >
                        <Typography>Delete Old Matches</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Button disabled={loading} onClick={() => cleanMatches()}>Clean DB{cleanSuccess && <Check className="button-check"></Check>}</Button>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </Container>
        </div>
    )
}

export default Admin;