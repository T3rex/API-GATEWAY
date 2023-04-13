const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const {createProxyMiddleware} = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');


const app = express();
dotenv.config();

const PORT = process.env.PORT;

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 15 minutes
	max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes)	
})

app.use(morgan('combined'));
app.use(limiter)
app.use('/bookingservice',async(req,res,next)=>{
    
    const response = await axios.get("http://localhost:3000/authservice/api/v1/isAuthenticated",{headers: { "x-access-token":  req.headers['x-access-token']}});
    console.log(response.data);    
    next();
});

app.use('/authservice', createProxyMiddleware({ target: 'http://localhost:2999',changeOrigin: true }));
app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3006',changeOrigin: true }));


app.get('/home', (req, res) =>{
    return res.json({message: "OK"});
});

app.listen(PORT,()=>{
    console.log('Server started at port '+PORT);
});