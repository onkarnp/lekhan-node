const dotenv = require("dotenv");
dotenv.config({path: './.env'});
const { json } = require('express');
const pool = require('../../db')
const queries = require('./queries')
const bcrypt = require('bcryptjs');
const { genSaltSync, hashSync,} = require("bcryptjs");


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
    console.log(req.body);


    pool.query(queries.checkEmailExists, [usermail], async (error, results) => {
        console.log(results);
        let isMatchPassword = await bcrypt.compare(userpass , results.rows[0].userpass); 
        console.log(isMatchPassword);
        if (error) throw error;
        if(!results.rows.length ) {

            return res.json("Email not exists");
        }
        if(isMatchPassword){
            console.log(process.env.TOKEN_KEY);
            res.status(200).json("Logged in successfully");
        }
        else{
            console.log("wrong password");
            res.status(200).json("Coudn't login, please check credentials");
        }    
    })
    
}   

const addUser = (req, res) => {
    var hashedPassword;
    const { username, usermail, userpass, usertypeid=1 } = req.body;
    //check if email exists
    pool.query(queries.checkEmailExists, [usermail], (error, results) => {
        if(results.rows.length) {
           return res.json("User already registered")
        }
        //add user to users table
        const salt = genSaltSync(10);
        epass = hashSync(userpass,salt);
        console.log(epass);
        pool.query(queries.addUser, [username, usermail, epass, usertypeid], (error, results) => {
            if(error) throw error;
           return res.status(201).json("User created successfully");
        })
    })
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
    addUser,
    updateUser,
    deleteUser,
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticleById,
    getMetadata,
    getMetadataById,
    updateMetadataById,
    deleteMetadataById,
    getUsertypes
};