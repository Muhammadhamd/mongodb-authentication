import express from "express"
import path from "path"
// import cors from "cors"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose"
import v1router from "./v1/index.mjs"
const app = express()
const __dirname = path.resolve()
const mongodbURI =  process.env.mongodbURI || "mongodb+srv://muhammadhamdali572:hamdali99332@cluster0.g7j5dka.mongodb.net/userdatabase?retryWrites=true&w=majority";
import cors from "cors"
app.use(express.json())

app.use(cors({
    origin: ['http://localhost:4000', "*"],
    credentials: true
}));

app.use(v1router)


app.use((req, res, next) => {

    console.log("req.cookies: ", req.cookies);

    if (!req?.cookies?.Token) {
        res.status(401).send({
            message: "include http-only credentials with every request"
        })
        return;
    }

    jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
        if (!err) {

            console.log("decodedData: ", decodedData);

            const nowDate = new Date().getTime() / 1000;

            if (decodedData.exp < nowDate) {

                res.status(401);
                res.cookie('Token', '', {
                    maxAge: 1,
                    httpOnly: true
                });
                res.send({ message: "token expired" })

            } else {

                console.log("token approved");

                req.body.token = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})


app.use(express.static(__dirname))

const PORT = process.env.PORT || 4000
app.listen(PORT,console.log(PORT))



mongoose.connect(mongodbURI);

////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function () {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});

