const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const {createProxyMiddleware} = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');


const app = express();
dotenv.config();

const PORT = 3005;
const AUTHENTICATION_LINK = 'http://localhost:3001/authservice/api/v1/isAuthenticated'
const AUTH_SERVICE_URL = 'http://localhost:3001'
const BOOKING_SERVICE_URL = 'http://localhost:3006'





const limiter = rateLimit({
	windowMs: 2 * 60 * 1000,
	max: 15, 	
})

app.use(morgan('combined'));
app.use(limiter)
app.use('/bookingservice',async(req,res,next)=>{
    try {
        const response = await axios.get(AUTHENTICATION_LINK,{headers: { "x-access-token":  req.headers['x-access-token']}});         
        if(response.data.success){
            next();
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unauthorized"
        });
    }
    
});

app.use('/authservice', createProxyMiddleware({ target: AUTH_SERVICE_URL,changeOrigin: true }));
app.use('/bookingservice', createProxyMiddleware({ target: BOOKING_SERVICE_URL,changeOrigin: true }));


app.get('/home', (req, res) =>{
    return res.json({message: "OK"});
});

app.listen(PORT,()=>{
    console.log('Server started at port '+PORT);
});