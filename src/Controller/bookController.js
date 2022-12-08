const userModel = require("../Models/userModel")
const bookModel = require("../Models/bookModel")
const reviewModel = require("../Models/reviewModel")
const aws= require("aws-sdk")

const { isValidName, isValidObjectId, validatorISBN
} = require("../validator/validator")
const moment = require("moment")

//=========================================<==CREATEBOOK API==>==============================================================//

const createBooks = async function (req, res) {
  try {
    const data = req.body;

    if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: 'plz provide Data' }) }// When body have No data

    //===========================validate by using validetor folder(by using Regex and somthing)===============================//

    if (!isValidName(data.title)) { return res.status(400).send({ status: false, message: 'Title is required' }) }


    if (!isValidName(data.excerpt)) { return res.status(400).send({ status: false, message: 'Excerpt is required' }) }

    if (!isValidName(data.userId)) { return res.status(400).send({ status: false, message: 'User Id is required' }) }

    if (!isValidObjectId(data.userId)) { return res.status(400).send({ status: false, message: 'Please provide a valid userId' }) }


    if (!isValidName(data.ISBN)) { return res.status(400).send({ status: false, message: 'ISBN is required' }) }

    if (!validatorISBN(data.ISBN)) { return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' }) }

    if (!isValidName(data.category)) { return res.status(400).send({ status: false, message: 'Category is required' }) }

    if (!isValidName(data.subcategory)) { return res.status(400).send({ status: false, message: 'Subcategory is required' }) }

    if (data.releasedAt) {
      function dateIsValid(dateStr) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;

        if (dateStr.match(regex) === null) { return false }
        const date = new Date(dateStr);
        if (date == "Invalid Date") { return false }

      }
      if (dateIsValid(data.releasedAt) == false) { return res.status(400).send({ status: false, message: 'releasedAt format should be `YYYY-MM-DD` & valid date' }) }
    }

    let isUniquetitle = await bookModel.findOne({ title: data.title })
    if (isUniquetitle) { return res.status(409).send({ status: false, message: 'Title already exists' }) }
    let isValidid = await userModel.findOne({ _id: data.userId })
    if (!isValidid) { return res.status(400).send({ status: false, message: 'User Id does not exists' }) }
    let isUniqueISBN = await bookModel.findOne({ ISBN: data.ISBN })
    if (isUniqueISBN) { return res.status(409).send({ status: false, message: 'ISBN already exists' }) }

    let date = moment().format("YYYY-MM-DD")

    if (!data.releasedAt) { data.releasedAt = date }
  

   
    aws.config.update({
      accessKeyId: "AKIAY3L35MCRZNIRGT6N",
      secretAccessKey: "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",
      region: "ap-south-1"
    })
    
    let uploadFile= async ( file) =>{
     return new Promise( function(resolve, reject) {
    
      let s3= new aws.S3({apiVersion: '2006-03-01'}); 

      var uploadParams= {
          ACL: "public-read",
          Bucket: "classroom-training-bucket",  
          Key: "abc/" + file.originalname, 
          Body: file.buffer
      }
    
    
      s3.upload( uploadParams, function (err, data ){
          if(err) {
              return reject({"error": err})
          }
          console.log(data)
          console.log("file uploaded succesfully")
          return resolve(data.Location)
      })
    
     })
    }
    
    let files= req.files
      if(files && files.length>0){
          let uploadedFileURL= await uploadFile( files[0] )
          data.bookCoverKey = uploadedFileURL
          const createBook = await bookModel.create(data)
          return res.status(201).send({ status: true, message: 'Success', data: createBook })
      }
      else{
          res.status(400).send({ msg: "No file found" })
      }

    return res.status(201).send({ status: true, message: 'Success', data: createBook })


  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}



//=========================================<==GETBOOK BY FILTRER API==>==============================================================//

const getBook = async function (req, res) {
  try {
    const queryParams = req.query;
    const userid = req.query.userId
    if (userid) {
      const ObjectId = require("mongodb").ObjectId;
      const validId = ObjectId.isValid(userid);
      if (!validId) { return res.status(400).send({ status: false, msg: "Invalid userId " }); }
    }

    const book = await bookModel.find({ isDeleted: false, ...queryParams, }).select({
      _id: 1, title: 1, excerpt: 1, userId: 1, category: 1,
      releasedAt: 1, reviews: 1
    }).sort({ title: 1 });


    if (book.length == 0) {
      return res.status(404).send({ status: false, msg: "Document doesn't exist" });
    }

    if (book) {
      return res.status(200).send({ status: true, message: 'Books list', count: book.length, data: book });
    }
  } catch (err) {

    return res.status(500).send({ status: false, message: err.message });
  }
};



//=========================================<==GETBOOK BY PSRAMS API==>==============================================================//

const booksById = async function (req, res) {
  try {
    const bookId = req.params.bookId
    if (!bookId) {
      return res.status(400).send({ status: false, message: "bookId is mandatory in Path" })
    }

    if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: 'provide a valid book Id' }) }
    const getdata = await bookModel.find({ _id: bookId, isDeleted: false })//.select({ ISBN: 0 })
    if (getdata.length == 0) {
      return res.status(404).send({ status: false, message: "No book exists in Database with this Id" })
    }
    const review = await reviewModel.find({ bookId: bookId, isDeleted: false })
      .select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

    const Data = {
      _id: getdata[0]._id,
      title: getdata[0].title,
      excerpt: getdata[0].excerpt,
      userId: getdata[0].userId,
      category: getdata[0].category,
      subcategory: getdata[0].subcategory,
      reviews: getdata[0].reviews,
      isDeleted: getdata[0].isDeleted,
      deletedAt: getdata[0].deletedAt,
      releasedAt: getdata[0].releasedAt,
      reviewsData: review
    }

    return res.status(200).send({ status: true, data: Data })
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


//=========================================<==DELETEBOOK BY PSRAMS API==>==============================================================//


const deletById = async function (req, res) {
  try {
    const bookId = req.params.bookId
    

    if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: 'Provide a valid Id' }) }

    const getdata = await bookModel.find({ _id: bookId, isDeleted: false })
    if (getdata.length == 0) {
      return res.status(404).send({ status: false, message: "No book exists in Database with this Id" })
    }
    let date = moment().format("YYYY-MM-DD")     //date by using Moment
    const deletData = await bookModel.findByIdAndUpdate({ _id: bookId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: date } })

    const deletReview = await reviewModel.updateMany({ bookId: bookId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: date } })


    return res.status(200).send({ status: true, message: "Successfully deleted the Book", })
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}



//=========================================<==UPDATEBOOK BY PSRAMS API==>==============================================================//
const updateById = async function (req, res) {
  try {
    const bookId = req.params.bookId
    const data = req.body

    
    if (Object.keys(data) == 0) {
      return res.status(400).send({ status: false, message: "Provide data to update" })
    }

    if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: 'Please provide a valid bookId' }) }


    let { title, ISBN, excerpt, releasedAt, category } = data

    if (excerpt) {
      if (!isValidName(excerpt)) { return res.status(400).send({ status: false, message: 'Excerpt should not be empty' }) }
    }
    if (category) {
      if (!isValidName(data.category)) { return res.status(400).send({ status: false, message: 'Category should not be empty' }) }
    }
    if (releasedAt) {
      function dateIsValid(dateStr) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;

        if (dateStr.match(regex) === null) { return false }
        const date = new Date(dateStr);
        if (date == "Invalid Date") { return false }
      }
      if (dateIsValid(data.releasedAt) == false) { return res.status(400).send({ status: false, message: 'releasedAt format should be `YYYY-MM-DD` & valid date' }) }
    }

    if (ISBN) {
      if (!isValidName(data.ISBN)) { return res.status(400).send({ status: false, message: 'ISBN should not be empty' }) }
      if (!validatorISBN(ISBN)) { return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' }) }

      const duplicate = await bookModel.findOne({ ISBN: ISBN })

      if (duplicate) {
        return res.status(409).send({ status: false, message: "ISBN is alredy exists in Database" })
      } // checking ISBN Number is Unique or not
    }

    if (title) {

      if (!isValidName(title)) { return res.status(400).send({ status: false, message: 'Title should not be empty' }) }

      const duplicateTitle = await bookModel.findOne({ title: title })

      if (duplicateTitle) {
        return res.status(409).send({ status: false, message: "Title is already exists in Database" })
      } // checking Title is Unique or not
    }

    const validobjectId = await bookModel.findOne({ _id: bookId, isDeleted: false })

    if (!validobjectId) { return res.status(404).send({ status: false, message: "No book exists in Database with this Id" }) }

    const updateData = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { ...data } }, { new: true })

    return res.status(200).send({ status: true, message: "Success", data: updateData })
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


//=======================================================================================================//



module.exports.createBooks = createBooks
module.exports.booksById = booksById
module.exports.getBook = getBook
module.exports.deletById = deletById
module.exports.updateById = updateById


