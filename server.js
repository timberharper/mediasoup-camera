const mediasoup = require('mediasoup');
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

// 提供 `app` 目录的静态文件
app.use(express.static("app"));
app.use("/socket.io", express.static("node_modules/socket.io/dist"));

async function startServer() {
    const worker = await mediasoup.createWorker();
    const mediaCodecs = [
        {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2
        },
        {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000
        }
    ];

    const router = await worker.createRouter({ mediaCodecs });

    // 新增：创建用于接收 RTP 流的 PlainTransport
    const transport = await router.createPlainTransport({
        listenIp: '0.0.0.0',
        rtcpMux: false,
        comedia: true,
        rtpPort: 5004
    });

    // 创建 Producer（让 Mediasoup 处理 RTP 视频流）
    const producer = await transport.produce({
        kind: 'video',
        rtpParameters: {
            codecs: [
            {
                mimeType: 'video/VP8',
                clockRate: 90000,
                payloadType: 96,
                parameters: {}
            }
           ],
            encodings: [
                { ssrc: 12345678 } // 添加 `ssrc`
            ]
       }
   });

    // 启动 WebSocket 服务器，监听客户端连接
    io.on("connection", (socket) => {
        console.log("WebRTC 客户端连接成功");
        if (producer) {
            socket.emit("rtpStream", { track: producer.track });
        } else {
            console.error("Producer 未初始化，无法推流！");
        }
    });

    server.listen(3000, () => {
        console.log("Web 服务器运行在 http://localhost:3000");
    });
    console.log('Mediasoup 服务器已启动！');
    console.log('RTP 端口:', transport.tuple.localPort);
}

startServer();
