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
import { Registry } from '@polkadot/types-codec/types/registry';

import { AnyJson } from '@polkadot/types/types/codec';
import { decodeU8aVec, typeToConstructor } from '@polkadot/types-codec/utils';

export type DecodeFunction = (registry: Registry, data: Uint8Array) => AnyJson;

// import { decodeU8aVec } from '@polkadot/types-codec/utils'; // TODO
// import { decodeVec } from '@polkadot/types-codec/base/Vec';

export const buildDecodeVector = (typeName: string): DecodeFunction => (registry: Registry, data: Uint8Array): AnyJson => {
  const vecType = typeToConstructor(registry, typeName);
  const decoded = decodeU8aVec(registry, [], data, 0, vecType);
  return decoded;
  // return decoded[0].flatMap((value) => value.toHuman());
};
