const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/chat", createProxyMiddleware({
    target: "https://api.openai.com/v1/chat/completions",
    changeOrigin: true,
    pathRewrite: { "^/chat": "" },
    onProxyReq: (proxyReq, req) => {
        if (req.headers["authorization"]) {
            proxyReq.setHeader("Authorization", req.headers["authorization"]);
        }
    }
}));

app.listen(3000, () => {
    console.log("Proxy running on port 3000");
});