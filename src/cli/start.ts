// Copyright 2021-2022 Prosopo (UK) Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import express from 'express';
import cors from 'cors';

// import { mnemonicValidate } from '@polkadot/util-crypto';

import { prosopoRouter } from '../api';
import { LocalAssetsResolver } from '../assets';
import { Environment, loadEnv } from '../env';
// import { MockEnvironment } from "../tests/mocks/mockenv";
import { handleErrors } from '../errors';
// import { processArgs } from './argv';

// import yargs from 'yargs';
// import { hideBin } from 'yargs/helpers';

// import dotenv from 'dotenv';
import { ProsopoEnvironment } from '../types/env';

import { Server } from 'http';
import { ProsopoEnvError } from "@prosopo/contract";
import { i18nMiddleware } from "@prosopo/i18n";

// loadEnv();

let apiAppSrv: Server;
// let imgAppSrv: Server;

function startApi(env: ProsopoEnvironment) {
    const apiApp = express();
    const apiPort = process.env.API_PORT || 3000;

    apiApp.use(cors());
    apiApp.use(express.json());
    apiApp.use(i18nMiddleware({}));
    apiApp.use(prosopoRouter(env));

    if (env.assetsResolver instanceof LocalAssetsResolver) {
        env.assetsResolver.injectMiddleware(apiApp); //
    }

    apiApp.use(handleErrors);
    apiAppSrv = apiApp.listen(apiPort, () => {
        env.logger.info(`Prosopo app listening at http://localhost:${apiPort}`);
    });
}

function startFileSrv(port: number | string, locations: string[]) {
    const app = express();

    locations.forEach(loc => {
        // allow local filesystem lookup at each location
        app.use("/", express.static(loc))
    })

    // only run server if locations have been specified
    if(locations.length > 0) {
        app.listen(port, () => {
            console.log(`File server running on port ${port} serving [${locations}]`);
        });
    }
}

// const argv = yargs(hideBin(process.argv)).argv;


async function start (nodeEnv: string) {

    loadEnv();

    let env: ProsopoEnvironment;

    if (nodeEnv !== 'test') {
        if (!process.env.PROVIDER_MNEMONIC) {
            throw new ProsopoEnvError("GENERAL.MNEMONIC_UNDEFINED");
        }
        env = new Environment(process.env.PROVIDER_MNEMONIC);
    } else {
    // env = new MockEnvironment();
        return;
    }

    await env.isReady();
    startApi(env);


    // setup the file server
    const port = process.env.FILE_SRV_PORT || 4000;
    // accept multiple paths for locations of files
    const paths = JSON.parse(process.env.FILE_SRV_PATHS || "[]");
    // if single path given convert to array
    const locations = Array.isArray(paths) ? paths : [paths];
    startFileSrv(port, locations);
}

function stop() {
    apiAppSrv.close();
    // imgAppSrv.close();
}

start(process.env.NODE_ENV || 'development')
    .catch((error) => {
        console.error(error);
    });
