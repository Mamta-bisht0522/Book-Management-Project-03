const express = require('express');
const router = express.Router();
const userController=require("../Controller/userController")
const bookController=require("../Controller/bookController")
const reviewController = require("../Controller/reviewController")


const auth = require("../middleware/auth")

//============================user Api===============================================//

router.post("/register",userController.createdUser)
router.post("/login",userController.userLogin)             // login Api


//============================== books API===========================================//

router.post("/books" ,auth.authenticate,auth.authorisation, bookController.createBooks)

router.get("/books", bookController.getBook) //auth.authenticate,

router.get("/books/:bookId", bookController.booksById) //auth.authenticate,

router.delete("/books/:bookId", bookController.deletById)

router.put("/books/:bookId",auth.authenticate,auth.authorisation, bookController.updateById)


//==============================reviews API===========================================//

router.post("/books/:bookId/review", reviewController.Reviewcreate);

router.put("/books/:bookId/review/:reviewId", reviewController.updateReview);  


router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview);    //auth.authenticate,auth.authorisation   // 



//===============================router validation(For path is valid or Not)===================================================//


router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Bad reqeust / invalid Path" });
  });


module.exports = router;
