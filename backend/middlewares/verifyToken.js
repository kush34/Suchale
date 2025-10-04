import jwt from 'jsonwebtoken';

const verifyToken = (req,res,next)=>{
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        // console.log(token);
        if(!token) res.status(401).send("Please Login First")
            
        const result = jwt.verify(token,process.env.jwt_Secret);
        if(!result) res.status(401).send("pls login again");

        req.username = result.username;
        req.email = result.email;

        console.log(req.email,req.username);
        next();
    } catch (error) {
        console.log(error.message);
    }
}

export default verifyToken;