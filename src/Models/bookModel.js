const mongoose =require("mongoose")
const ObjectId = mongoose.Schema.ObjectId
const bookSchema=new mongoose.Schema({

    title: { type:String, required:true,unique:true ,trim: true},
    excerpt: {type:String, required:true}, 
    userId: {type:ObjectId,required:true, ref:"User"},
    ISBN: {type:String, required:true, unique:true},
    category: {type:String,required:true},
    subcategory: {type:String, required:true},
    reviews: {type:Number,  default: 0},
    deletedAt: {type:Date}, 
    isDeleted: {type:Boolean, default: false},
    releasedAt: {type:Date,required:true},
    bookCoverKey:{type:String}

},{timestamp:true})

module.exports=mongoose.model("Book",bookSchema)