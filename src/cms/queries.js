// User queries
const checkEmailExists = `SELECT * FROM "cmsSchema".users WHERE usermail = $1`;
const checkUserExists = `SELECT * FROM "cmsSchema".users WHERE usermail = $1 and userpass = $2`;
const getAllUsers = `SELECT * FROM "cmsSchema".users where usertypeid=$1`;
const addUser = `INSERT INTO "cmsSchema".users(username, usermail, userpass, usertypeid) VALUES ($1, $2, $3, $4)`;
const getUserById = `SELECT * FROM "cmsSchema".users WHERE userid = $1`;
const updateUser = 'UPDATE "cmsSchema".users SET username=$2, usermail=$3, userpass=$4, usertypeid=$5 WHERE userid=$1';
const deleteUser = 'DELETE FROM "cmsSchema".users WHERE userid=$1';

// Queries for article
const getArticles = `SELECT * FROM "cmsSchema".contents`;
const getArticleByContentid =
`SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.contentid = $1
order by cm.submissiondate desc;
`
const createArticle = `INSERT INTO "cmsSchema".contents(title, description, image) values ($1, $2, $3)`;
const updateArticle = `UPDATE "cmsSchema".contents SET title=$2, description=$3, image=$4 WHERE contentid=$1`;
const deleteArticleById = `DELETE FROM "cmsSchema".contents WHERE contentid=$1`;

// To check if content with provided author and title already exists
const checkIfContentAlreadyExists = `SELECT * FROM "cmsSchema".contents c
INNER JOIN "cmsSchema".contentmetadata cm ON c.contentid = cm.contentid
WHERE c.title = $1 AND cm.author = $2;`

// To check if content with provided id already published
const checkIfContentidAlreadyPublished = 
`SELECT * FROM "cmsSchema".contentmetadata
  WHERE status = 'finalized' AND contentid = $1;`

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
    SET status = $4, lasteditedby = $7, lastediteddate = CURRENT_TIMESTAMP
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
INSERT INTO "cmsSchema".contentmetadata (contentid, author, status, submissiondate, lasteditedby, lastediteddate) 
VALUES ((SELECT contentid FROM inserted_content), $5, $6, CURRENT_TIMESTAMP, $5, CURRENT_TIMESTAMP);`

//To save edited article with updated file
const saveEditedArticleWithFile = 
`WITH updated_content AS (
  UPDATE "cmsSchema".contents
  SET title = $1, description = $2
  WHERE contentid = $3
  RETURNING imgid
),
updated_metadata AS (
  UPDATE "cmsSchema".contentmetadata
  SET lasteditedby = $6, lastediteddate = CURRENT_TIMESTAMP
  WHERE contentid = $3
)
UPDATE "cmsSchema".images
SET imgname = $4, imgdata = $5
WHERE imgid = (SELECT imgid FROM updated_content);`

//To save edited article without updated file
const saveEditedArticleWithoutFile = 
`WITH updated_content AS (
  UPDATE "cmsSchema".contents
  SET title = $1, description = $2
  WHERE contentid = $3
  RETURNING imgid
)
UPDATE "cmsSchema".contentmetadata 
SET lasteditedby = $4, lastediteddate = CURRENT_TIMESTAMP
WHERE contentid = $3
`

//To finalize edited article
const finalizeEditedArticle = 
`UPDATE "cmsSchema".contentmetadata
SET status = 'finalized', submissiondate = CURRENT_TIMESTAMP, lasteditedby = $2, lastediteddate = CURRENT_TIMESTAMP WHERE contentid = $1;`

// To finalize article
const finalizeArticle = 
`UPDATE "cmsSchema".contentmetadata SET status = 'finalized' WHERE contentid = (SELECT contentid FROM "cmsSchema".contents WHERE title = $1 AND author = $2 LIMIT 1)`

// To fetch user's all articles
const getAllArticles = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.author = $1
order by cm.submissiondate desc;
`
// To get saved articles by an author
const getSavedArticles = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.author = $1 and cm.status = $2
order by cm.submissiondate desc;
`
// To get finalized articles by an author
const getFinalizedArticles = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.author = $1 and cm.status = $2 and cm.assignedqa is null
order by cm.submissiondate desc;
`

const getArticlesAtQA = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.author = $1 and cm.status = 'finalized' and cm.qachecked = false
order by cm.submissiondate desc;
`

// To assign QA for an article
const assignQA = `UPDATE "cmsSchema".contentmetadata set assignedqa=$1 where contentid=$2`

// To assign CR for an article
const assignCR = `UPDATE "cmsSchema".contentmetadata set assignedcr=$1 where contentid=$2`

// To get finalizes articles irrespective of author
const getFinalizedArticlesForQA = 
`SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.status = $1 and cm.assignedqa is null
order by cm.submissiondate desc;
`

// To get articles which are not yet checked by QA 
const getQARequestedArticles = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.author = $1 and cm.assignedqa is NOT NULL and qachecked = false
order by cm.submissiondate desc;
`

// To get articles for an QA to which assigned to him
const getQARequestedArticlesForQA = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.assignedqa = $1 and qachecked = false
order by cm.submissiondate desc;
`

// To get articles which are at QA checked stage
const getQACheckedArticles = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.author = $1 and qachecked = true and cm.assignedcr is null
order by cm.submissiondate desc;
`

//TO get articles for QA checked by him
const getQACheckedArticlesForQA = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.assignedqa = $1 and qachecked = true and crchecked = false
order by cm.qacheckeddate desc;
`

// To approve an article by QA
const approveArticleByQA = `UPDATE "cmsSchema".contentmetadata SET assignedqa=$2, qachecked=true, qacheckeddate=CURRENT_TIMESTAMP WHERE contentid=$1`

// To approve an article by CR
const approveArticleByCR = `UPDATE "cmsSchema".contentmetadata SET assignedcr=$2, crchecked=true, crcheckeddate=CURRENT_TIMESTAMP WHERE contentid=$1`

const getQACheckedArticlesForCR = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE qachecked = true and assignedcr is null
order by cm.qacheckeddate desc;
`


const getCRRequestedArticles = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.author = $1 and cm.assignedcr is NOT NULL and crchecked = false
order by cm.submissiondate desc;
`

const getCRRequestedArticlesForCR = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.assignedcr=$1 and crchecked = false
order by cm.qacheckeddate desc;
`


const getUserPublishedArticles = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.author = $1 and cm.crchecked = true
order by cm.submissiondate desc;
`

// To get all pulished article
const getPublishedArticles = `SELECT c.contentid, c.title, c.description, i.imgname, i.imgdata, cm.author, u1.username AS authorname, cm.status, cm.submissiondate, cm.assignedqa, u2.username AS assignedqaname, cm.qachecked, cm.qacheckeddate, cm.assignedcr, u3.username AS assignedcrname, cm.crchecked, cm.crcheckeddate, cm.lasteditedby, cm.lastediteddate, u4.username AS lasteditedbyname
FROM "cmsSchema".contents AS c
INNER JOIN "cmsSchema".images AS i ON c.imgid = i.imgid
INNER JOIN "cmsSchema".contentmetadata AS cm ON c.contentid = cm.contentid
LEFT JOIN "cmsSchema".users u1 ON cm.author = u1.userid
LEFT JOIN "cmsSchema".users u2 ON cm.assignedqa = u2.userid
LEFT JOIN "cmsSchema".users u3 ON cm.assignedcr = u3.userid
LEFT JOIN "cmsSchema".users u4 ON cm.lasteditedby = u4.userid
WHERE cm.crchecked = true
order by cm.crcheckeddate desc;
`

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
    getArticleByContentid,
    createArticle,
    updateArticle,
    deleteArticleById,
    getPublishedArticles,
    checkIfContentAlreadyExists,
    checkIfContentidAlreadyPublished,
    checkIfContentAlreadyPublished,
    overwriteArticle,
    saveNewArticle,
    saveEditedArticleWithFile,
    saveEditedArticleWithoutFile,
    finalizeEditedArticle,
    finalizeArticle,
    getAllArticles,
    getSavedArticles,
    getFinalizedArticles,
    getArticlesAtQA,
    getFinalizedArticlesForQA,
    getQARequestedArticles,
    getQARequestedArticlesForQA,
    getQACheckedArticles,
    getQACheckedArticlesForQA,
    approveArticleByQA,
    approveArticleByCR,
    getQACheckedArticlesForCR,
    getCRRequestedArticles,
    getCRRequestedArticlesForCR,
    getUserPublishedArticles,
    assignQA,
    assignCR,
    getMetadata,
    getMetadataById,
    updateMetadataById,
    deleteMetadataById,
    getUsertypes
}