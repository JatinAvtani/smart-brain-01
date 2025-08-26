
import mongoose, {model, Schema} from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB with proper error handling
const connectDB = async () => {
    try {
        const dbUrl = process.env.DB_URL || process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('Database URL not found in environment variables');
        }
        
        await mongoose.connect(dbUrl);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Call the connection function
connectDB();

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    type: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true },
})

const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
})

export const LinkModel = model("Links", LinkSchema);
export const ContentModel = model("Content", ContentSchema);