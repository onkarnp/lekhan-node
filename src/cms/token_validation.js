
const jwt = require("jsonwebtoken");
const express = require("express");
var app = express();
const cookieParser =require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config({path: './.env'});
app.use(cookieParser());



// const checkToken = (req, res, next) => {
//     const token = req.cookies.cmscookie;

//     if(!token){
//         return res.status(401).json({
//             success: 0,
//             message: "No token provided"
//         });
//     }

//     try{
//         const decoded = jwt.verify(token, this.process.env.TOKEN_KEY);
//         req.decoded = decoded;
//         next();
//     } catch(error) {
//         return res.status(401).json({
//             success: 0,
//             message: "Invalid token"
//         });
//     }
// }

// module.exports = checkToken;


module.exports = { 
    checkToken : async(req, res, next) => {
        const cookie = req.cookies.cmscookie;
        

        if(!cookie){
            return res.status(401).json({
                success: 0,
                message: "No token provided"
            });
        }
        
        try{
            claims = jwt.verify(cookie, process.env.TOKEN_KEY);
            req.decoded = claims;
            next();
        } catch(error) {
            return res.status(401).json({
                success: 0,
                message: "Invalid token"
            });
        }



        // try{

        
        //     let token = req.cookies.cmscookie || req.headers['Authorization'];

        //     //if(token == null) {res.status(401).send("Token Not Found")}

        //     if(token){
        //         jwt.verify(token,process.env.TOKEN_KEY,(err,decoded) => { 

        //         if(err){
        //             return res.status(231).json({
        //                 success: 0,
        //                 message: "Invalid Token"
        //             });
        //         }
        //         else{
        //             //res.status(200).send();
        //             req.decoded = decoded;
        //             next();
        //         }

        //         });

        //     }
        //     else{
        //         return res.status(235).json({
        //             success:0,
        //             message : "Token Not Exists"
        //         });
        
        //     }
    

        // }
        // catch(err){
        //     res.status(299).send("Unauthorized token not provided");
        //     console.log(err);
        // }
        
    }

};
