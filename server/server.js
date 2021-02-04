import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles';
import Template from '../template';
import app from './express';
import setupLocal from './auth/passportLocal';
import setUpGoogle from './auth/google';
import setupFacebook from './auth/facebook';
import authRouter from './auth/auth.routes';
import userRouter from './routes/users.routes';
// import { insertEmailTemplate } from './models/emailTemplate';
import { setUpJWT } from './auth/jwt';

// modules for server side rendering
import { MainRouter } from '../client/MainRouter';

import theme from '../client/theme';
// end

// comment out before building for production
import devBundle from './devBundle';

require('dotenv').config();

// comment out before building for production
devBundle.compile(app);

const CURRENT_WORKING_DIR = process.cwd();

// Serving up static files
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')));

// Setup Database Connection
const MONGO_URL = process.env.MONGO_URL_TEST;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

mongoose.connect(MONGO_URL, options);
mongoose.connection.on('error', () => {
  throw new Error(`Cannot connect to database ${MONGO_URL}`);
});

// Setup Port
const port = process.env.PORT || 3000;
const ROOT_URL = `http://localhost:${port}`;

// insertEmailTemplate();

// Setup Local and OAuth for Authorization, JWT for Authentication

setUpJWT({ app });
setupLocal({ app, ROOT_URL });
setUpGoogle({ app, ROOT_URL });
setupFacebook({ app, ROOT_URL });

app.use('/auth/users', authRouter);
app.use('/users', userRouter);

app.get('*', (req, res) => {
  const sheets = new ServerStyleSheets();
  const context = {};
  const markup = ReactDOMServer.renderToString(
    sheets.collect(
      <StaticRouter location={req.url} context={context}>
        <ThemeProvider theme={theme}>
          <MainRouter />
        </ThemeProvider>
      </StaticRouter>,
    ),
  );
  if (context.url) {
    return res.redirect(303, context.url);
  }
  const css = sheets.toString();
  res.status(200).send(
    Template({
      markup,
      css,
    }),
  );
});

app.listen(port, () => {
  console.log(`Server is on PORT ${port}`); // eslint-disable-line
});
