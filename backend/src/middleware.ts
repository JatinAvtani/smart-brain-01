import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    
    if (!header) {
        res.status(403).json({
            message: "You are not logged in"
        })
        return;
    }
    
    try {
        const decoded = jwt.verify(header as string, JWT_PASSWORD)
        if (typeof decoded === "string") {
            res.status(403).json({
                message: "You are not logged in"
            })
            return;    
        }
        req.userId = (decoded as JwtPayload).id;
        next()
    } catch (error) {
        res.status(403).json({
            message: "You are not logged in"
        })
    }
}
