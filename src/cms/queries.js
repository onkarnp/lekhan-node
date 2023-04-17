// User queries
const checkEmailExists = `SELECT * FROM "cmsSchema".users WHERE usermail = $1`;
const checkUserExists = `SELECT * FROM "cmsSchema".users WHERE usermail = $1 and userpass = $2`;
const getAllUsers = `SELECT * FROM "cmsSchema".users`;
const addUser = `INSERT INTO "cmsSchema".users(username, usermail, userpass, usertypeid) VALUES ($1, $2, $3, $4)`;
const getUserById = `SELECT * FROM "cmsSchema".users WHERE userid = $1`;
const updateUser = 'UPDATE "cmsSchema".users SET username=$2, usermail=$3, userpass=$4, usertypeid=$5 WHERE userid=$1';
const deleteUser = 'DELETE FROM "cmsSchema".users WHERE userid=$1';

// Queries for article
const getArticles = `SELECT * FROM "cmsSchema".contents`;
const getArticleById = `SELECT * FROM "cmsSchema".contents WHERE contentid = $1`;
const createArticle = `INSERT INTO "cmsSchema".contents(title, description, image) values ($1, $2, $3)`;
const updateArticle = `UPDATE "cmsSchema".contents SET title=$2, description=$3, image=$4 WHERE contentid=$1`;
const deleteArticleById = `DELETE FROM "cmsSchema".contents WHERE contentid=$1`;

//Queries for metadata
const getMetadata = `SELECT * FROM "cmsSchema".contentmetadata`;
const getMetadataById = `SELECT * FROM "cmsSchema".contentmetadata WHERE contentid=$1`;
const deleteMetadataById = `DELETE FROM "cmsSchema".contentmetadata WHERE contentid=$1`;
const updateMetadataById = `UPDATE "cmsSchema".contentmetadata SET author=$2, status=$3, submissiondate=$4, assignedqa=$5, qachecked=$6, qacheckeddate=$7, assignedcr=$8, crchecked=$9, crcheckeddate=$10 WHERE contentid=$1`;

//Queries for usertype table
const getUsertypes = `SELECT * FROM "cmsSchema".usertype`;
module.exports = {
    checkEmailExists,
    checkUserExists,
    getAllUsers,
    addUser,
    getUserById,
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
}