const express = require('express');
const aws= require("aws-sdk")
const router = express.Router();
const userController=require("../Controller/userController")
const bookController=require("../Controller/bookController")
const reviewController = require("../Controller/reviewController")
const auth = require("../middleware/auth")



//============================ user Api ===============================================//

router.post("/register",userController.createdUser)                                                    // Mamta
router.post("/login",userController.userLogin)                                                        // by Vanshika


//==============================  books API ===========================================//

router.post("/books" ,auth.authenticate,auth.authorisation, bookController.createBooks)               // mamta 

router.get("/books",auth.authenticate, bookController.getBook)                                       // mamta

router.get("/books/:bookId",auth.authenticate, bookController.booksById)                             // Yash 

router.delete("/books/:bookId",auth.authenticate,auth.authorisation, bookController.deletById)       // newton

router.put("/books/:bookId",auth.authenticate,auth.authorisation, bookController.updateById)         // by Vanshika 


//==============================reviews API===========================================//

router.post("/books/:bookId/review", reviewController.Reviewcreate);                                  // vanshika

router.put("/books/:bookId/review/:reviewId", reviewController.updateReview);                         // Yash

router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview);                      // newton

//===========================================AWS=====================================================================

// aws.config.update({
//   accessKeyId: "AKIAY3L35MCRZNIRGT6N",
//   secretAccessKey: "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",
//   region: "ap-south-1"
// })

// let uploadFile= async ( file) =>{
//  return new Promise( function(resolve, reject) {

//   let s3= new aws.S3({apiVersion: '2006-03-01'}); 
//   var uploadParams= {
//       ACL: "public-read",
//       Bucket: "classroom-training-bucket",  
//       Key: "abc/" + file.originalname, 
//       Body: file.buffer
//   }


//   s3.upload( uploadParams, function (err, data ){
//       if(err) {
//           return reject({"error": err})
//       }
//       console.log(data)
//       console.log("file uploaded succesfully")
//       return resolve(data.Location)
//   })

//  })
// }

// router.post("/write-file-aws", async function(req, res){

//   try{
//       let files= req.files
//       if(files && files.length>0){
//           let uploadedFileURL= await uploadFile( files[0] )
//           res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
//       }
//       else{
//           res.status(400).send({ msg: "No file found" })
//       }
      
//   }
//   catch(err){
//       res.status(500).send({msg: err})
//   }
  
// })

//===============================router validation(For path is valid or Not)===================================================//


router.all("/*", async function (req, res) {
    return res.status(400).send({ status: false, message: "Bad reqeust / invalid Path" });
  });


module.exports = router;


                                                                                                       // authenticate   // newton

                                                                                                        // authorisation  // Yash