const dotenv = require("dotenv");
dotenv.config({path: './.env'});
const fs = require('fs');
const { json } = require('express');
const pool = require('../../db')
const queries = require('./queries')
const Datauri = require('datauri');
const path = require('path');
const bcrypt = require('bcryptjs');
const { genSaltSync, hashSync,} = require("bcryptjs");
const jwt = require('jsonwebtoken');
// const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage });


//To convert filedata to base64 string
const convertByteaToBase64 = (fileData) =>{
    const base64Data = Buffer.from(fileData).toString('base64');
    return 'data:image/png;base64,'+ base64Data;
}  

//To convert time from postgres to Indian local time
const convertToIndianTime = (date) =>{
    const timestamp = new Date(date);
    const options = { timeZone: 'Asia/Kolkata' };
    const formattedTimestamp = timestamp.toLocaleString('en-US', options);
    return formattedTimestamp;
}


const getAllUsers = (req, res) => {
    pool.query(queries.getAllUsers, (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    })
}

const getUserById = (req, res) => {
    userid = req.params.id;
    pool.query(queries.getUserById, [userid], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    })
}

const loginByMailPassword = async (req, res) => {
    const { usermail, userpass } = req.body;
    try{
        pool.query(queries.checkEmailExists, [usermail], async (error, results) => {
            if(error){
                console.log(error);
                return res.status(400).send({       //status code 400 - bad request
                    success: 0,
                    message : "Database connection error"
                })
            }
            if(!results.rows.length ) {
                return res.status(401).json({       //status code 401 - unauthorized response
                    success: 0,
                    message: "User with provided mail doesn't exists"
                });
            }
                   
            let isMatchPassword = await bcrypt.compare(userpass , results.rows[0].userpass); 
            if(isMatchPassword){                
                jwt.sign({ userid: results.rows[0].userid }, process.env.TOKEN_KEY, {expiresIn: "24h"}, (err, token) => {
                    if (error) throw err;
                    res.cookie('cmscookie', token, {
                        maxAge: 24 * 60 * 60 * 1000,
                        // httpOnly:true,
                        // secure:true                   
                    })
                    
                    return res.status(200).json({
                        success: 1,
                        message: "Logged in successfully",
                        token: token
                    }) 
                });
            }
            else{
                
                return res.status(401).json({
                    success: 0,
                    message: "Wrong password"       //status code 401 - unauthorized response
                });
            }     
        })        
    }
    catch(e){
        console.log(e);
    }  
}   


const checkIfLoggedIn = async (req, res) => {
    try{
        const cookie = req.cookies.cmscookie;
        claims = jwt.verify(cookie, process.env.TOKEN_KEY);
        if(!claims){
            return res.status(401).send({       //status code 401 - unauthorized
                success: 0,
                message: 'Unauthenticated'
            })
        }
        try{
            pool.query(queries.getUserById, [claims.userid], (error, results) => {
                if(error){
                    console.log(error);
                    return res.status(400).json({       //status code 400 - bad request
                        success: 0,
                        message : "Database connection error"
                    })
                }
                if(results.rows.length) {
                    const data = {
                        userid: results.rows[0].userid,
                        username: results.rows[0].username,
                        usermail: results.rows[0].usermail,
                        usertypeid: results.rows[0].usertypeid
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "Authenticated",
                        data: data 
                    })
                }

            })
        }
        catch(e){
            console.log(e);
        }
    }catch(e){
        console.log(e);
        return res.status(401).json({
            success: 0,
            message: "unauthenticated1"
        })
    }
    
}


const logoutUsingCookie = (req, res) => {
    res.cookie('cmscookie', '', {maxAge: 0})
    return res.json({
        success: 1,
        message: "Logged out successfully"
    })
}

const addUser = (req, res) => {
    const { username, usermail, userpass, usertypeid=1 } = req.body;
    try{
        //check if email exists
        pool.query(queries.checkEmailExists, [usermail], (error, results) => {
            if(error){
                console.log(error);
                return res.status(400).json({       //status code 400 - bad request
                    success: 0,
                    message : "Database connection error"
                })
            }
            if(results.rows.length) {
                return res.status(409).json({       //status code 409 - conflicts
                    success: 0,
                    message: "User already registered"
                })
            }
            //add user to users table
            const salt = genSaltSync(10);
            epass = hashSync(userpass,salt);
            // console.log(epass);
            pool.query(queries.addUser, [username, usermail, epass, usertypeid], (error, results) => {
                if(error){
                    console.log(error);
                    return res.status(400).json({       //status code 400 - bad request
                        success: 0,
                        message : "Database connection error"
                    })
                }
                return res.status(201).json({       //status code 201 - created success
                    success: 1,
                    message: "Signed up successfully"
                });
            })
        })
    }
    catch(e){
        console.log(e);
    }
    
}


const updateUser = (req, res) => {
    const userid = parseInt(req.params.id);
    const { username, usermail, userpass, usertypeid } = req.body;
    pool.query(queries.getUserById, [userid], (error, results) => {
        console.log(results.rows);
        if(results.rows.length){
            pool.query(queries.updateUser, [userid, username, usermail, userpass, usertypeid], (error, results) => {
                if(error) throw error;
                res.status(200).send("User updated successfully");
                console.log("User updated successfully");
            })
        }
        else{
            res. send("User with given userid not found on the database");
        }        
    })
}

const deleteUser = (req, res) => {
    const userid = parseInt(req.params.id);
    pool.query(queries.getUserById, [userid], (error, results) => {
        if(error) throw error;
        if(results.rows.length){
            pool.query(queries.deleteUser, [userid], (error, results) => {
                if(error) throw error;
                res.status(200).send("User deleted");
            })
        }
        else{
            res.send("No user with provided userid found");
        }
    })
}

const getArticles = (req, res) => {
    pool.query(queries.getArticles, (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    })
}

const getArticleById = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getArticleById, [id], (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    })
}

const createArticle = (req, res) => {
    const { title, description, image } = req.body;
    pool.query(queries.createArticle, [title, description, image], (error, results) => {
        if(error) throw error;
        res.status(201).send("Article created");
        console.log("Article created");
    })
}

const updateArticle = (req, res) => {
    const contentid = parseInt(req.params.id);
    const { title, description, image } = req.body;
    pool.query(queries.getArticleById, [contentid], (error, results) => {
        if(results.rows.length){
            pool.query(queries.updateArticle, [ contentid, title, description, image ], (error, results) => {
                if (error) throw error;
                res.status(200).send("Article updated successfully");
            })
        }
        else{
            res.send("No article found with provided id");
        }
    })
}


const deleteArticleById = (req, res) => {
    const contentid = parseInt(req.params.id);
    pool.query(queries.getArticleById, [contentid], (error, results) => {
        if(results.rows.length){
            pool.query(queries.deleteArticleById, [ contentid ], (error, results) => {
                if (error) throw error;
                res.status(200).send("Article deleted successfully");
            })
        }
        else{
            res.send("No article found with provided id");
        }
    })
}

const getPublishedArticles = (req, res) => {
    try{
        pool.query(queries.getPublishedArticles, (error, results) => {
            if(error){
                console.log(error);
                return res.status(400).json({       //status code 400 - bad request
                    success: 0,
                    message : "Database connection error"
                })
            }
            if(results.rows.length){
                if (error) throw error;
                
                // ***************************************
                
                results.rows.forEach(row => {
                    const base64FileData = convertByteaToBase64(row.imgdata);
                    row.base64FileData = base64FileData;
                    row.submissiondate = convertToIndianTime(row.submissiondate);
                });

                // console.log(results.rows);

                // ***********************************
                return res.status(200).json({
                    success:1,
                    message: "Published articles fetched successfully",
                    data: results.rows
                })
            }
            else{
                return res.status(200).json({
                    success:0,
                    message: "No published article found",
                }) 
            }
        })
    }
    catch(e){
        console.log(e);
    } 
}


// const checkIfContentAlreadyExists = (title, author) => {
//     try{
//         pool.query(queries.checkIfContentAlreadyExists, [title, author], (error, results) => {
//             if(results.rows.length){
//                 if (error) throw error;
//                 return true;
//             }
//             else{
//                 return false; 
//             }
//         })
//     }
//     catch(e){
//         console.log(e);
//     }
// }

const saveArticle = async (req, res) =>{
    // console.log('req.body', req.body);
    // console.log('req.file', req.file);
    try{
        const {title, description, author, status} = req.body;
        const imgdata = req.file.buffer;
        const imgname = req.file.originalname;
        // const imgdata = new Blob([fileData]);
        pool.query(queries.checkIfContentAlreadyExists, [title,author], (error, results) => {
            if(error){
                console.log(error);
                return res.status(400).json({       //status code 400 - bad request
                    success: 0,
                    message : "Database connection error"
                })
            }
            if(results.rows.length) //Content with provided title and author already exists
            {
                const contentidNotPublished = results.rows[0].contentid;
                //check if it is already published
                pool.query(queries.checkIfContentAlreadyPublished, [title, author], (error, results) => {
                    if(error){
                        console.log(error);
                        return res.status(400).json({       //status code 400 - bad request
                            success: 0,
                            message : "Database connection error"
                        })
                    }
                    if(results.rows.length){
                        //the content is already published
                        return res.status(400).json({       //status code 400 - bad request
                            success: 0,
                            message : "Content with provided title is already published, try altering the title"
                        }) 
                    } 
                    else{
                        //overwrite the content
                        // console.log(contentidNotPublished);
                        // title description contentid status imgname imgdata
                        pool.query(queries.overwriteArticle, [title, description, contentidNotPublished, status, imgname, imgdata], (error, results) => {
                            if(error){
                                console.log(error);
                                return res.status(400).json({       //status code 400 - bad request
                                    success: 0,
                                    message : "Database connection error"
                                })
                            }
                            return res.status(200).json({
                                success: 1,
                                message: "Content updated successfully"
                            })
                        })
                        
                    }
                })
                
            }
            else{ //Content with provided title and author does not exists
                console.log('sample');
                pool.query(queries.saveNewArticle, [imgname, imgdata, title, description, author, status], (error,results) => {
                    if(error){
                        console.log(error);
                        return res.status(400).json({       //status code 400 - bad request
                            success: 0,
                            message : "Database connection error"
                        })
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "Content saved successfully"
                    })
                })
            }
        })
    }
    catch(e){
        console.log(e);
    }
}


const publishArticle = (req, res) => {
    const { title, author } = req.body;
    pool.query(queries.publishArticle, [title, author], (error, results) => {
        if(error){
            console.log(error);
            return res.status(400).json({       //status code 400 - bad request
                success: 0,
                message : "Database connection error"
            })
        }
        return res.status(200).json({
            success: 1,
            message: "Content published successfully"
        })
    });
}




const getMetadata = (req, res) => {
    pool.query(queries.getMetadata, (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    })
}

const getMetadataById = (req, res) => {
    const contentid = req.params.id;
    pool.query(queries.getMetadataById, [contentid], (error, results) => {
        if(error) throw error;
        if(results.rows.length)
            res.status(200).json(results.rows)
        else
            res.send("No data found");
    })
}

const updateMetadataById = (req, res) => {
    const contentid = req.params.id;
    const { author, status="saved", submissiondate=null, assignedqa=null, qachecked=false, qacheckeddate=null, assignedcr=null, crchecked=false, crcheckeddate=null } = req.body;
    pool.query(queries.getMetadataById, [contentid], (error,results) => {
        if(error) throw error;
        if(!results.rows.length)
            res.send("No entry found for provided contentid");
        pool.query(queries.updateMetadataById, [contentid, author, status, submissiondate, assignedqa, qachecked, qacheckeddate, assignedcr, crchecked, crcheckeddate], (error, results) => {
            if(error) throw error
            res.status(200).send("Article metadata uodated successfully.")
        })
    })
    
}

const deleteMetadataById = (req, res) => {
    const contentid = req.params.id;
    pool.query(queries.getMetadataById, [contentid], (error, results) => {
        if(error) throw error;
        if(!results.rows.length)
            res.send("No article with provided id found on database");
        else{
            pool.query(queries.deleteMetadataById, [contentid], (error, results) => {
                if(error) throw error;
                res.status(200).send("Article deleted successfully");
            })
        }
    })
}

const getUsertypes = (req, res) => {
    pool.query(queries.getUsertypes, (error, results) => {
        if(error) throw error;
        res.status(200).json(results.rows);
    })
}









module.exports = {
    getAllUsers,
    getUserById,
    loginByMailPassword,
    logoutUsingCookie,
    checkIfLoggedIn,
    addUser,
    updateUser,
    deleteUser,
    getArticles,
    getArticleById,
    getPublishedArticles,
    // checkIfContentAlreadyExists,
    // checkIfContentAlreadyPublished,
    saveArticle,
    publishArticle,
    createArticle,
    updateArticle,
    deleteArticleById,
    getMetadata,
    getMetadataById,
    updateMetadataById,
    deleteMetadataById,
    getUsertypes
};




















  