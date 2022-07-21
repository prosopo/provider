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
import {ApiPromise, WsProvider} from '@polkadot/api';

const providers = {
    'kusama': {'endpoint': 'wss://kusama-rpc.polkadot.io/'},
    'polkadot': {'endpoint': 'wss://rpc.polkadot.io'}
}

async function run() {
    // Construct
    for (const provider in providers) {
        const wsProvider = new WsProvider(providers[provider].endpoint);
        const api = await ApiPromise.create({provider: wsProvider});

        // Do something
        const validators = await api.query.staking.validators.keys();
        console.log(`${validators.length} validators on ${provider}`);
    }
    process.exit()

}

run()
