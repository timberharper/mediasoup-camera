const mediasoup = require('mediasoup');

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

    console.log('Mediasoup 服务器已启动！');
}

startServer();
