import { WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/common-in-backend/config";
import jwt, { JwtPayload } from "jsonwebtoken"

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", function connection(ws, request){

  const url = request.url;
  if(!url){
    return;
  }

  const queryParam = new URLSearchParams(url.split('?')[1]);
  const token = queryParam.get('token') || "";
  const decode= jwt.verify(token,JWT_SECRET);


  if(typeof decode =="string"){
    ws.close();
    return;
  }
  if(!decode || !decode.userId){
    ws.close();
    return;
  }
  ws.on("message", function message (data) {
    ws.send('pong');
  });

  ws.on("close", () => {
    // cleanup room
  });
});

console.log("WS server running.");
