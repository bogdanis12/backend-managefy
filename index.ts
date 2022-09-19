import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";

import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import shiftRouter from './routes/shift.route';
import commentsRouter from './routes/comments.route';
import permissionsRouter from './routes/permissions.route';


import { setup } from './utils/mongoSetup';
import { Config } from "./types";
import { tokenGuard } from "./middlewares/tokenGuard.middleware";



const config = require('config') as Config;

const { PORT } = config;

setup();
const app = express();

app.use(morgan('common'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/user', authRouter);
app.use(tokenGuard);//All bellow should use IExtended request to get access to req.context
app.use('/api/user', userRouter)
app.use('/api/shift', shiftRouter)
app.use('/api/comment', commentsRouter)
app.use('/api/permissions', permissionsRouter)




app.listen(PORT);