// Copyright (C) 2021-2022 Prosopo (UK) Ltd.
// This file is part of provider <https://github.com/prosopo-io/provider>.
//
// provider is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// provider is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with provider.  If not, see <http://www.gnu.org/licenses/>.
import express from 'express';
import cors from 'cors';
import { URL } from 'url';

// import { mnemonicValidate } from '@polkadot/util-crypto';

import { prosopoRouter } from '../api';
import { LocalAssetsResolver } from '../assets';
import { Environment, loadEnv } from '../env';
// import { MockEnvironment } from "../tests/mocks/mockenv";
import { ERRORS, handleErrors } from '../errors';
// import { processArgs } from './argv';

// import yargs from 'yargs';
// import { hideBin } from 'yargs/helpers';

// import dotenv from 'dotenv';
import { ProsopoEnvironment } from '../types/env';

import { Server } from 'http';

// loadEnv();

let apiAppSrv: Server;
// let imgAppSrv: Server;

function startApi(env: ProsopoEnvironment) {
  const apiApp = express();
  const apiPort = process.env.API_PORT || 3000;

  apiApp.use(cors());
  apiApp.use(express.json());
  apiApp.use(prosopoRouter(env));

  if (env.assetsResolver instanceof LocalAssetsResolver) {
    env.assetsResolver.injectMiddleware(apiApp); //
  }

  apiApp.use(handleErrors);
  apiAppSrv = apiApp.listen(apiPort, () => {
    env.logger.info(`Prosopo app listening at http://localhost:${apiPort}`);
  });
}

// function startImg() {
//   const imgApp = express();
//   const imgPort = process.env.IMG_SRV_PORT || 4000;

//   imgApp.use('/img', express.static('./data/img'));

//   imgApp.get('/', (req, res) => {
//     res.send('Image server');
//   });

//   imgAppSrv = imgApp.listen(imgPort, () => {
//     console.log(`Image server running on port ${imgPort} serving images from /data/img`);
//   });
// }

// const argv = yargs(hideBin(process.argv)).argv;

// TODO: Arguably ./argv.processArgs.command
async function start (nodeEnv: string) {

  loadEnv();

  let env: ProsopoEnvironment;

  if (nodeEnv !== 'test') {
    if (!process.env.PROVIDER_MNEMONIC) {
      throw new Error(ERRORS.GENERAL.MNEMONIC_UNDEFINED.message);
    }
    env = new Environment(process.env.PROVIDER_MNEMONIC);
  } else {
    // env = new MockEnvironment();
    return;
  }

  await env.isReady();
  startApi(env);

  // if (argv['img'])
  // startImg();
}

function stop() {
  apiAppSrv.close();
  // imgAppSrv.close();
}

start(process.env.NODE_ENV || 'development')
  .catch((error) => {
    console.error(error);
  });
