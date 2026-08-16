import { Server } from "socket.io";


let connections = [];
let messages = {};
let timeOnline = {};



export const connectToSocket = (server)=>{
    
    const io = new Server(server, {
        cors:{
            origin:"http://localhost:5173",
            methods:["GET","POST"],
            // allowedHeaders:["*"],
            credentials:true
        }
    });

    io.on("connection", (socket)=>{
        
        //console.log("socketManager");
        //console.log("User connected:", socket.id);

        socket.on("join-call", (path)=>{
            // To store the user url in connections.
            if(connections[path] === undefined){
                connections[path] = [];
            }
            connections[path].push(socket.id)
            
            //Time manage.
            timeOnline[socket.id] = new Date();

            // Every person to received to message to connection the new person.
            for(let a = 0; a < connections[path].length; a++){
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
            }
            
            // for the history manage.
            if(messages[path] !== undefined){
                for(let a = 0; a <messages[path].length; a++){
                    io.to(socket.id).emit("chat-message", 
                        messages[path][a]['data'],
                        messages[path][a]['sender'],
                        messages[path][a]['socket-id-sender']
                    )
                }
            }
        });

        socket.on("signal", (toId, message)=>{
           io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender)=>{
            //console.log("message: ", data);
           //To find the person url/Room
           const [matchingRoom, found] = Object.entries(connections)
           .reduce(([room, isFound], [roomKey, roomValue])=>{
                if (!isFound && roomValue.includes(socket.id)) {
                   return [roomKey, true];
                }
                return [room, isFound];
            }, ['', false]);

            if(found === true){
                if(messages[matchingRoom] === undefined){
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({'sender':sender, 'data':data, "socket-id-sender":socket.id});
                console.log("messages: ", matchingRoom, ":", sender, data);

                connections[matchingRoom].forEach((elem)=>{
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                })
            }
        })

        socket.on("disconnect", ()=>{

            //when i call desconnected then messages Empty. {}
            messages = {};
            const diffTime = Math.abs(timeOnline[socket.id] - new Date());
            
            let key;

            //To store value connections key in 'k' and value 'v'
            for(const [k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){

                for(let a = 0; a<v.length; a++){   
                    if(v[a] === socket.id){
                       key = k;

                        for(let a = 0; a <connections[key].length; a++){
                           io.to(connections[key][a]).emit("user-left", socket.id)
                        }

                        const index = connections?.indexOf(socket.id);

                        connections[key].splice(index, 1)

                        if(connections[key].length === 0){
                            delete connections[key]
                        }
                    }
                }
            }
        })
        //console.log("109-Messages: ",messages);
    })

    return io;
} 