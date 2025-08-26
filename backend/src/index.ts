import express, { Request, Response } from "express";
import { random } from "./utils";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import cors from "cors";

const app = express();
app.use(express.json());

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://smart-brain-01.vercel.app',
      'https://smart-brain-frontend.vercel.app',
      'https://smart-brain.vercel.app',
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    ]
  : true; // Allow all origins in development

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


app.post("/api/v1/signup", (async (req: Request, res: Response) => {
    try {
        // TODO: zod validation , hash the password
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        await UserModel.create({
            username: username,
            password: password
        }) 

        res.json({
            message: "User signed up"
        })
    } catch(e) {
        console.error("Signup error:", e);
        res.status(411).json({
            message: "User already exists"
        })
    }
}) as any)

app.post("/api/v1/signin", (async (req: Request, res: Response) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const existingUser = await UserModel.findOne({
            username,
            password
        });

        if (existingUser) {
            const token = jwt.sign({
                id: existingUser._id
            }, JWT_PASSWORD);

            res.json({
                token
            });
        } else {
            res.status(403).json({
                message: "Incorrect credentials"
            });
        }
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}) as any)

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        title: req.body.title,
        userId: req.userId,
        tags: []
    })

    res.json({
        message: "Content added"
    })
    
})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username")
    res.json({
        content
    })
})

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
})

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const share = req.body.share;
    if (share) {
            const existingLink = await LinkModel.findOne({
                userId: req.userId
            });

            if (existingLink) {
                res.json({
                    hash: existingLink.hash
                })
                return;
            }
            const hash = random(10);
            await LinkModel.create({
                userId: req.userId,
                hash: hash
            })

            res.json({
                hash
            })
    } else {
        await LinkModel.deleteOne({
            userId: req.userId
        });

        res.json({
            message: "Removed link"
        })
    }
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    });

    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }
    // userId
    const content = await ContentModel.find({
        userId: link.userId
    })

    console.log(link);
    const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })

})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});