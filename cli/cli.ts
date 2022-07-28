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
import { mnemonicValidate } from '@polkadot/util-crypto';
// import { prosopoMiddleware } from '../api';
// import { LocalAssetsResolver } from '../assets';
import { Environment, loadEnv } from '../env';
import { ERRORS } from '../errors';
import { processArgs } from './argv';

import dotenv from 'dotenv';

loadEnv();

async function main () {

  if (!process.env.PROVIDER_MNEMONIC) {
    throw new Error(ERRORS.GENERAL.MNEMONIC_UNDEFINED.message);
  }

  mnemonicValidate(process.env.PROVIDER_MNEMONIC);
  const env = new Environment(process.env.PROVIDER_MNEMONIC);

  await env.isReady();
  await processArgs(process.argv.slice(2), env);

  process.exit();

}

main()
  .catch((error) => {
    console.error(error);
  });