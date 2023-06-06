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
// To get all pulished article
const getPublishedArticles = `SELECT c.contentid, c.title, c.description, c.image, u1.username AS author, u2.username AS assignedqa, u3.username AS assignedcr, To_CHAR(cm.crcheckeddate, 'YYYY-MM-DD') as crcheckeddate 
FROM "cmsSchema".contents c
LEFT JOIN "cmsSchema".contentmetadata cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
WHERE cm.crchecked=true;`

// To check if content with provided author and title already exists
const checkIfContentAlreadyExists = `SELECT * FROM "cmsSchema".contents c
INNER JOIN "cmsSchema".contentmetadata cm ON c.contentid = cm.contentid
WHERE c.title = $1 AND cm.author = $2;`

const checkIfContentAlreadyPublished = `SELECT * FROM "cmsSchema".contents c
INNER JOIN "cmsSchema".contentmetadata cm ON c.contentid = cm.contentid
WHERE c.title = $1 AND cm.author = $2 AND cm.status = 'finalized';`

// title description contentid status imgname imgdata
const overwriteArticle = `
  WITH updated_content AS (
    UPDATE "cmsSchema".contents
    SET title = $1,
        description = $2
    WHERE contentid = $3
    RETURNING contentid, imgid
  ), updated_contentmetadata AS(
    UPDATE "cmsSchema".contentmetadata AS cm
    SET status = $4
    FROM updated_content AS uc
    WHERE cm.contentid = uc.contentid
  )
  UPDATE "cmsSchema".images AS i
  SET imgname = $5,
      imgdata = $6
  FROM updated_content AS uc
  WHERE i.imgid = uc.imgid;
`


// To save article
const saveNewArticle = 
`WITH inserted_image AS (
    INSERT INTO "cmsSchema".images (imgname, imgdata) 
    VALUES ($1, $2) 
    RETURNING imgid
), inserted_content AS (
    INSERT INTO "cmsSchema".contents (title, description, imgid)
    SELECT $3, $4, imgid 
    FROM inserted_image 
    RETURNING contentid
)
INSERT INTO "cmsSchema".contentmetadata (contentid, author, status, submissiondate) 
VALUES ((SELECT contentid FROM inserted_content), $5, $6, CURRENT_DATE);`

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
    getPublishedArticles,
    checkIfContentAlreadyExists,
    checkIfContentAlreadyPublished,
    overwriteArticle,
    saveNewArticle,
    getMetadata,
    getMetadataById,
    updateMetadataById,
    deleteMetadataById,
    getUsertypes
}