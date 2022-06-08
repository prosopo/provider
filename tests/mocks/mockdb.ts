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
import {ERRORS} from '../../src/errors';
import {Db, Document, Filter, MongoClient} from "mongodb";
import {MongoMemoryServer} from "mongodb-memory-server";
import {Database, DatasetRecord, PendingCaptchaRequestRecord, Tables} from '../../src/types';
import {
  Captcha,
  CaptchaSolution,
  CaptchaStates,
  Dataset,
  DatasetWithIdsAndTree,
  DatasetWithIdsAndTreeSchema
} from '@prosopo/contract';
import {Hash} from "@polkadot/types/interfaces";
import {isHex} from "@polkadot/util";

export const SOLVED_CAPTCHAS = [
  {
    // "_id" : "0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9",
    captchaId: '0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9',
    datasetId: '0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605',
    index: 0,
    items: [
      {
        path: '/home/user/dev/prosopo/data/img/01.01.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.02.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.03.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.04.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.05.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.06.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.07.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.08.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.09.jpeg',
        type: 'image'
      }
    ],
    salt: '0x01',
    solution: [
      2,
      3,
      4
    ],
    target: 'bus'
  },
  {
    // "_id": "0x894d733d37d2df738deba781cf6d5b66bd5b2ef1041977bf27908604e7b3e604",
    captchaId: '0x894d733d37d2df738deba781cf6d5b66bd5b2ef1041977bf27908604e7b3e604',
    solution: [
      1,
      8,
      9
    ],
    salt: '0x02',
    target: 'train',
    items: [
      {
        path: '/usr/src/data/img/01.01.jpeg',
        type: 'image'
      },
      {
        path: '/usr/src/data/img/01.02.jpeg',
        type: 'image'
      },
      {
        path: '/usr/src/data/img/01.03.jpeg',
        type: 'image'
      },
      {
        path: '/usr/src/data/img/01.04.jpeg',
        type: 'image'
      },
      {
        path: '/usr/src/data/img/01.05.jpeg',
        type: 'image'
      },
      {
        path: '/usr/src/data/img/01.06.jpeg',
        type: 'image'
      },
      {
        path: '/usr/src/data/img/01.07.jpeg',
        type: 'image'
      },
      {
        path: '/usr/src/data/img/01.08.jpeg',
        type: 'image'
      },
      {
        path: '/usr/src/data/img/01.09.jpeg',
        type: 'image'
      }
    ]
  }
];

const UNSOLVED_CAPTCHAS = [
  {
    // "_id" : "0x1b3336e2e69ca56f44e44cef13cc96e87972175a2d48068cb72327c73ca22268",
    captchaId: '0x1b3336e2e69ca56f44e44cef13cc96e87972175a2d48068cb72327c73ca22268',
    datasetId: '0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605',
    index: 1,
    items: [
      {
        path: '/home/user/dev/prosopo/data/img/01.01.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.02.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.03.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.04.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.05.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.06.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.07.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.08.jpeg',
        type: 'image'
      },
      {
        path: '/home/user/dev/prosopo/data/img/01.09.jpeg',
        type: 'image'
      }
    ],
    salt: '0x02',
    target: 'train'
  }
];

export const DATASET = {
  _id: '0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605',
  datasetId: '0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605',
  format: 'SelectAll',
  tree: [
    [
      '0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9',
      '0x894d733d37d2df738deba781cf6d5b66bd5b2ef1041977bf27908604e7b3e604',
      '0xaeffcc3d1f9f461f43b1db75e366ac8fc231c19d9fdf4a4dbbe6dcb561e9936c',
      '0x51f1f4f0077cf4d5bccbb5bfd6b07bb4d8544cfed3fefb5a4d2a4e0b217b6fbc',
      '0x17ba2bbf5926bdf709f01c822288efa53bb516bd1ba5b13eae807da6505c85a0',
      '0x8a1aa5c298c4d0f7f8d3cc7dd983427a271fb6a5db35e3ea8c47039138af4ea1',
      '0x79bd0f5c97a7098e9784035dae92656b09b2312d1a03ca487e2569f730815212'
    ],
    [
      '0x40ccd7d86bb18860c660a211496e525a3cacc4b506440e56ac85ac824a253378',
      '0x76cb07140a3c9e1108e392386b286d60dd5e302dc59dfa8c049045107f8db854',
      '0x34194f72bedca1ce8edf70d8525517f2d7eb1ee69ab76e235fbf996e8c07fcc3',
      '0xb730f53e3008da99fd51ee3ecf8cc6e974c5da1cf5e94958314025e39a491948'
    ],
    [
      '0x8b12abef36bfa970211495a826922d99f8a01a66f2e633fff4874061f637d814',
      '0xe52b9fc3595ec17f3ad8d7a8095e1b730c9c4f6be21f16a5d5c9ced6b1ef8903'
    ],
    [
      '0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605'
    ]
  ]
};

export class InMemoryProsopoDatabase implements Database {

  dbname: string;
  tables: Tables;
  url: string;

  constructor(url, dbname) {
    this.url = url;
    this.tables = {};
    this.dbname = dbname;
  }

  async connect() {
    try {
      const mongod = await MongoMemoryServer.create();
      this.url = mongod.getUri();
      const client: MongoClient = new MongoClient(this.url);

      await client.connect();
      const db: Db = client.db(this.dbname);

      this.tables.dataset = db.collection('dataset');
      this.tables.captchas = db.collection('captchas');
      this.tables.solutions = db.collection('solutions');
      this.tables.responses = db.collection('responses');
      this.tables.pending = db.collection('pending');

    } catch (err) {
      throw new Error(ERRORS.DATABASE.CONNECT_ERROR.message);
    }
  }

  /**
   * @description Load a dataset to the database
   * @param {Dataset}  dataset
   */
  async storeDataset (dataset: DatasetWithIdsAndTree): Promise<void> {
    try {
      const parsedDataset = DatasetWithIdsAndTreeSchema.parse(dataset);
      const datasetDoc = {
        datasetId: parsedDataset.datasetId,
        format: parsedDataset.format,
        tree: parsedDataset.tree
      };
      console.log(parsedDataset);

      await this.tables.dataset?.updateOne({ _id: parsedDataset.datasetId }, { $set: datasetDoc }, { upsert: true });
      // put the dataset id on each of the captcha docs
      const captchaDocs = parsedDataset.captchas.map((captcha, index) => ({
        ...captcha,
        datasetId: parsedDataset.datasetId,
        index
      }));

      // create a bulk upsert operation and execute
      await this.tables.captchas?.bulkWrite(captchaDocs.map((captchaDoc) => ({
        updateOne: {
          filter: { _id: captchaDoc.captchaId },
          update: { $set: captchaDoc },
          upsert: true
        }
      })));
    } catch (err) {
      throw new Error(`${ERRORS.DATABASE.DATASET_LOAD_FAILED.message}:\n${err}`);
    }
  }

  /**
   * @description Get random captchas that are solved or not solved
   * @param {boolean}  solved    `true` when captcha is solved
   * @param {string}   datasetId  the id of the data set
   * @param {number}   size       the number of records to be returned
   */
  async getRandomCaptcha (solved: boolean, datasetId: Hash | string | Uint8Array, size?: number): Promise<Captcha[] | undefined> {
    if (!isHex(datasetId)) {
      throw new Error(`${ERRORS.DATABASE.INVALID_HASH.message}: datasetId`);
    }

    const sampleSize = size ? Math.abs(Math.trunc(size)) : 1;
    const cursor = this.tables.captchas?.aggregate([
      { $match: { datasetId, solution: { $exists: solved } } },
      { $sample: { size: sampleSize } },
      {
        $project: {
          datasetId: 1, captchaId: 1, items: 1, target: 1
        }
      }
    ]);
    const docs = await cursor?.toArray();
    console.log(docs);

    if (docs) {
      // drop the _id field
      return docs.map(({ _id, ...keepAttrs }) => keepAttrs) as Captcha[];
    }

    throw (ERRORS.DATABASE.CAPTCHA_GET_FAILED.message);
  }

  /**
   * @description Get captchas by id
   * @param {string[]} captchaId
   */
  async getCaptchaById (captchaId: string[]): Promise<Captcha[] | undefined> {
    const cursor = this.tables.captchas?.find({ _id: { $in: captchaId } });
    const docs = await cursor?.toArray();

    if (docs) {
      // drop the _id field
      return docs.map(({ _id, ...keepAttrs }) => keepAttrs) as Captcha[];
    }

    throw (ERRORS.DATABASE.CAPTCHA_GET_FAILED.message);
  }

  /**
   * @description Update a captcha solution
   * @param {Captcha}  captcha
   * @param {string}   datasetId  the id of the data set
   */
  async updateCaptcha (captcha: Captcha, datasetId: Hash | string | Uint8Array): Promise<void> {
    if (!isHex(datasetId)) {
      throw new Error(`${ERRORS.DATABASE.INVALID_HASH.message}: datasetId`);
    }

    await this.tables.captchas?.updateOne(
      { datasetId },
      { $set: captcha },
      { upsert: false }
    );
  }

  /**
   * @description Get a captcha that is solved or not solved
   */
  async getDatasetDetails (datasetId: Hash | string): Promise<DatasetRecord> {
    if (!isHex(datasetId)) {
      throw new Error(`${ERRORS.DATABASE.INVALID_HASH.message}: datasetId`);
    }

    const doc = await this.tables.dataset?.findOne({ datasetId });

    if (doc) {
      return doc as DatasetRecord;
    }

    throw (ERRORS.DATABASE.DATASET_GET_FAILED.message);
  }

  /**
   * @description Store a Dapp User's captcha solution
   */
  async storeDappUserSolution (captchas: CaptchaSolution[], treeRoot: string) {
    if (!isHex(treeRoot)) {
      throw new Error(`${ERRORS.DATABASE.INVALID_HASH.message}: treeRoot`);
    }

    // create a bulk create operation and execute
    await this.tables.solutions?.bulkWrite(captchas.map((captchaDoc) => ({
      insertOne: {
        document: {
          captchaId: captchaDoc.captchaId,
          solution: captchaDoc.solution,
          salt: captchaDoc.salt,
          treeRoot
        }
      }
    })));
  }

  /**
   * @description Store a Dapp User's pending record
   */
  async storeDappUserPending (userAccount: string, requestHash: string, salt: string): Promise<void> {
    if (!isHex(requestHash)) {
      throw new Error(`${ERRORS.DATABASE.INVALID_HASH.message}: requestHash`);
    }

    await this.tables.pending?.updateOne(
      { _id: requestHash },
      { $set: { accountId: userAccount, pending: true, salt } },
      { upsert: true }
    );
  }

  /**
   * @description Get a Dapp user's pending record
   */
  async getDappUserPending (requestHash: string): Promise<PendingCaptchaRequestRecord> {
    if (!isHex(requestHash)) {
      throw new Error(`${ERRORS.DATABASE.INVALID_HASH.message}: requestHash`);
    }

    const doc = await this.tables.pending?.findOne({ _id: requestHash });

    if (doc) {
      return doc as PendingCaptchaRequestRecord;
    }

    throw (ERRORS.DATABASE.PENDING_RECORD_NOT_FOUND.message);
  }

  /**
   * @description Update a Dapp User's pending record
   */
  async updateDappUserPendingStatus (userAccount: string, requestHash: string, approve: boolean): Promise<void> {
    if (!isHex(requestHash)) {
      throw new Error(`${ERRORS.DATABASE.INVALID_HASH.message}: requestHash`);
    }

    await this.tables.pending?.updateOne(
      { _id: requestHash },
      { $set: { accountId: userAccount, pending: false, approved: approve } },
      { upsert: true }
    );
  }

  /**
   * @description Get all unsolved captchas
   */
  async getAllCaptchasByDatasetId (datasetId: string, state?: CaptchaStates): Promise<Captcha[] | undefined> {
    let query: Filter<Document> = {
      datasetId
    };

    switch (state) {
      case CaptchaStates.Solved:
        query.solution = { solution: { $exists: true } };
        break;
      case CaptchaStates.Unsolved:
        query = { solution: { $exists: false } };
        break;
    }

    const cursor = this.tables.captchas?.find(query);
    const docs = await cursor?.toArray();

    if (docs) {
      // drop the _id field
      return docs.map(({ _id, ...keepAttrs }) => keepAttrs) as Captcha[];
    }

    throw (ERRORS.DATABASE.CAPTCHA_GET_FAILED.message);
  }

  /**
   * @description Get all dapp user's solutions
   */
  async getAllSolutions (captchaId: string): Promise<CaptchaSolution[] | undefined> {
    const cursor = this.tables.solutions?.find({ captchaId });
    const docs = await cursor?.toArray();

    if (docs) {
      // drop the _id field
      return docs.map(({ _id, ...keepAttrs }) => keepAttrs) as CaptchaSolution[];
    }

    throw (ERRORS.DATABASE.SOLUTION_GET_FAILED.message);
  }


}
