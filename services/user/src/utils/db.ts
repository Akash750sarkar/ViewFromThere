import mongoose from "mongoose";

const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI as string,{
            dbName:"blog",
        }  );
        console.log("connected to mongoDB");
    } catch (error) {
        console.log(error);
    }    
};

export default connectDb;