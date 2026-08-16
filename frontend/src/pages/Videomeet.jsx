import React from 'react'
import { useRef, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicNoneIcon from '@mui/icons-material/MicNone';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { server_url } from "../api/axiosInstance.js"
import { io } from "socket.io-client";
//import "./videomeet.css";
import style from "./pages.module.css";
import Badge from '@mui/material/Badge';
import { toast, ToastContainer } from 'react-toastify';

let connections = {}

const peerconfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.actionvoip.com:3478" }
  ]
}

function Videomeet() {

  const navigate = useNavigate();

  let socketRef = useRef(null);
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvaiable, setAudioAvaiable] = useState(true);

  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();

  let [showChatModel, setChatModel] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessage, setNewMessage] = useState(9);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);
  
  const [deletBtn, setDeletBtn]  = useState(null);
   

  async function getPermissions() {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermission) {
        setAudioAvaiable(true);
      } else {
        setAudioAvaiable(false);
      }

      //ScreenSharing........
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      //to store the audio&video.
      if (videoAvailable || audioAvaiable) {
        const useMediaStrem = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvaiable });

        if (useMediaStrem) {
          window.localStream = useMediaStrem;
          if (localVideoRef.current) {
            // to display to video on the screen
            localVideoRef.current.srcObject = useMediaStrem;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    getPermissions();
  }, []);

  const getUserMediaSuccess = (stream) => {

    try {
      //to stop the all the old steam.
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);


      // they have the createOffrer
      connections[id].createOffer().then((description) => {

        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
          }).catch(e => console.log(e));

      }).catch(e => console.log(e));

    }


    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);
      setScreenAvailable(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (e) {
        console.log(e);
      }

      //When uer close the mic/video then come to BlackScreen.
      let blackSlience = (...args) => new MediaStream([blackeScreen(...args), silence()]);
      window.localStream = blackSlience();
      localVideoRef.current.srcObject = window.localStream;

      for (let id in connections) {
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketIdRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
            }).catch((e) => console.log(e));

        })
      }
    })
  }

  //to create silence when the mutend audio.
  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });

  }

  const blackeScreen = ({ width = 640, height = 480 } = {}) => {

    let canvas = Object.assign(document.createElement("canvas"), { width, height });

    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }


  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvaiable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());

      } catch (e) {
        console.log(e);
      }
    }
  }

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  const gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {

        // reciever Offere.
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {

            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
              }).catch((e) => console.log(e));
            }).catch((e) => conosle.log(e));

          }

        }).catch(e => console.log(e));
      }

      //console.log(signal);

      if (signal.ice) {
        if (connections[fromId].remoteDescription) {
          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
        }
      }
    }

  };

  const addMessage = (message, username, socketId) => {
    //console.log("socketId: ", socketId);
  

    setMessages((prev) => [
      ...prev, { sender: username, data: message }
    ]);
    

    if (socketId !== socketIdRef.current) {
      setNewMessage((prev) => prev + 1);
    }
  };


  const connectToSocketSever = () => {

    //to connect to backend!
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {

      //console.log("fronted: ", socketRef.current.id);

      socketRef.current.emit("join-call", window.location.href);


      //console.log("soketRef: ", socketRef.current.id)
      socketIdRef.current = socketRef.current.id;
      // console.log("socketId: ", socketIdRef);

      socketRef.current.on("chat-message", addMessage)

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {

          //To create WebRTC peerConnection different and store in connctions Object.
          connections[socketListId] = new RTCPeerConnection(peerconfigConnections);

          //"The onicecandidate event is triggered whenever WebRTC discovers an ICE candidate.
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          };

          //When the receive the audio/video on the Stream then.
          connections[socketListId].onaddstream = (event) => {

            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if (videoExists) {
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              })
            } else {

              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true
              };

              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          //TO store the  local audio and video with the help of addStream.
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            //let blackSlience;
            let blackSlience = (...args) => new MediaStream([blackeScreen(...args), silence()]);
            window.localStream = blackSlience();
            connections[socketListId].addStream(window.localStream)

          }

        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue

            try {
              //To use a addStream to a local camara and mic in WebRTC peer connection.
              connections[id].addStream(window.localStream)
            } catch (err) {
              console.log(err);
            }

            //createOffer() generates an SDP offer describing the local WebRTC capabilities.
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit("signal", id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                }).catch(e => console.log(" WEBRTC ERROR:", e));
            });

          }
        }

      })

    })
  }

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvaiable);
    getUserMedia()
    connectToSocketSever();
  }
  const connect = () => {
    if (username.length >= 3){ 
      setAskForUsername(false);
      getMedia();
    }else{
      toast.warning("Enter valid userName", {position:"top-center"});
    }
  }

  const getDisplayMediaSuccess = (stream) => {

    try {
      window.localStream.getTracks().forEach(tracks => tracks.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = window.localStream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ 'sdp': connections[id].localDescription }));
          }).catch(e => console.log(e));
      })
    }

    stream.getTracks().forEach(track => track.onended = () => {

      setScreen(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (e) {
        console.log(e);
      }

      //When uer close the mic/video then come to BlackScreen.
      let blackSlience = (...args) => new MediaStream([blackeScreen(...args), silence()]);
      window.localStream = blackSlience();
      localVideoRef.current.srcObject = window.localStream;

      getUserMedia();

    })
  }

  const getDisplayMedia = () => {
    if (screen) {
      if (screenAvailable) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((strem) => { }).catch((e) => console.log(e));
      }
    }
  }

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  const toggleScreen = () => {
    setScreen(!screen);
  }

  const handleCallEnd = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    navigate("/home")
  }
 // console.log("All video: ", videos);

  //  chat message
  const sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  }

  //video trackt mangament.
  const toggleCamera = () => {
    setVideo(!video);
  };
  const toggleMic = () => {
    setAudio(!audio);
  }

  const toggleChat = () => {
    setChatModel(!showChatModel);
  }
  
  const handleInp = (e)=>{
    e.preventDefault()
   setMessage(e.target.value)
  }
  
  const deletedMessage =(item)=>{
    const mess = item.data;
    const newMess = messages.filter((prev)=> prev.data !== mess);
    setMessages(newMess);
    setDeletBtn(null);
  }
  
  const shareBtn = async()=>{
    const mess = `Join the video  call`;
    const shareData = {
      text: username ? `Hi I am ${username} Join  video call!`:mess,
      url:window.location.href,
    }
    try{
      const sh = await navigator.share(shareData);
    }catch(err){
      console.log(err);
    }

  }

  return (
    <>
      {askForUsername === true ?
        <div style={{marginLeft:"3rem", marginTop:"2rem"}}>
          <h2>Enter you Lobby</h2>
          <div className={style.LobbySection}>
            <div className={style.LobbySectionInp}>
              <TextField
                id="outlined-basic"
                label="username"
                value={username}
                name={username}
                onChange={e => setUsername(e.target.value)}
                variant="outlined"
              />
            </div>
            <div className={style.LobbySectionBtn}>
              <Button variant="contained" onClick={connect}>Connect</Button>
              <Button variant='contained' onClick={shareBtn}>Share Link</Button>
            </div>
          </div>
          <div className={style.onCamaraVideo}>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div> :
        <>

          <div className={style.meetVideoContainer}>

            {showChatModel ? <div className={style.chatRoom}>
              <div className='chatContainer'>

                {/* Display chating */}
                <div className={style.chattingDisplay}>
                  {messages.length > 0 ? messages.map((item, index) => {
                    return (
                      <div style={{ marginBottom: "20px" }} key={index}>
                        <div className={style.chatMessages}>
                          {/* <div className={style.deletBtn}></div> */}
                          {username === item.sender ?
                            <><small className={style.deletBtn}>{deletBtn===index?<DeleteIcon onClick={()=>deletedMessage(item)}></DeleteIcon>:""}</small><p className={style.userChat} onClick={()=>setDeletBtn(index)}>{item.data}</p></> :
                            <p className={style.otherChart}>{item.data}</p>
                          }
                        </div>
                      </div>
                    )
                  }) : <div></div>}
                </div>

                <div className={style.chatingArea}>
                  <TextField
                    className={style.chatInp}
                    onChange={handleInp}
                    value={message}
                    id="standard-basic"
                    label="Enter you Message"
                    variant="standard"
                  />
                  <Button style={{ marginRight: "1rem" }} onClick={sendMessage} variant='contained'>send</Button>
                </div>
              </div>
            </div> : <div>

            </div>
            }

            <div className={style.buttonContainer}>
              <IconButton style={{ color: "white" }} onClick={toggleCamera}>
                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton onClick={handleCallEnd} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
              <IconButton style={{ color: "white" }} onClick={toggleMic}>
                {(audio === true) ? <MicNoneIcon /> : <MicOffIcon />}
              </IconButton>
              <IconButton style={{ color: "white" }} onClick={toggleScreen}>
                {(screenAvailable === true) ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton>
              <Badge badgeContent={newMessage} max={99} color="primary">
                <IconButton style={{ color: 'white' }} onClick={toggleChat}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>

            {/* your Video */}
            <video className={(showChatModel ? style.meetUserVideoWithChat : style.meetUserVideo)} ref={localVideoRef} autoPlay muted></video>
            <div className={showChatModel ? style.conferenceViewWithChat : style.conferenceView}>
              {videos.map((video) => (
                <div key={video.socketId}>
                  <video
                    
                    data-socket={video.socketId}
                    ref={ref => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }}
                    autoPlay
                  />
                </div>
              ))}
            </div>

          </div>
        </>
      }
     < ToastContainer/>
    </>

  )
}
//className={video.length >= 2 ? style.conferenceWithTwoVideo:""}
export default Videomeet
