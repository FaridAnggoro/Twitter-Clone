import mongoose from "mongoose";

const connectMongoDB = async () => {
 
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB terkoneksi: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Koneksi ke MongoDB: ${error.message}`);
        process.exit(1);
    }
}

export default connectMongoDB;