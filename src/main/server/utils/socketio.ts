import { Server } from "socket.io";

export function bindSocketIOFunctions(io:Server){
  io.on("connection", (socket) => {
    console.log("connected to socket")
  })
}
