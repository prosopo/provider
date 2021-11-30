import {AnyError, Collection, Db, Document, MongoClient, InsertManyResult} from "mongodb";
import {Database} from './types'
import {ERRORS} from './errors'
import {Captcha, Dataset} from "./types/captcha";


export class ProsopoDatabase implements Database {
    readonly url: string;
    collections: { contract?: Collection, captchas?: Collection, dataset?: Collection }
    dbname: string


    constructor(url, dbname) {
        this.url = url || "mongodb://localhost:27017";
        this.collections = {};
        this.dbname = dbname;
    }

    async connect() {
        const client: MongoClient = new MongoClient(this.url);
        await client.connect();
        const db: Db = client.db(this.dbname);
        this.collections.dataset = db.collection("dataset");
        this.collections.captchas = db.collection("captchas");
    }

    async loadDataset(dataset: Dataset): Promise<AnyError | InsertManyResult<Document>> {
        return new Promise<AnyError | InsertManyResult>((resolve, reject) => {
                if (this.collections.captchas !== undefined && this.collections.dataset) {
                    const datasetDoc = {
                        datasetId: dataset.datasetId,
                        format: dataset.format
                    }
                    this.collections.dataset.updateOne({datasetId: dataset.datasetId}, {$set:datasetDoc}, {upsert: true})
                    const captchaDocs = dataset.captchas.map(c => ({...c, datasetId: dataset.datasetId}));
                    this.collections.captchas.insertMany(captchaDocs, function (err, result) {
                        if (err) {
                            reject(err);
                        }
                        if (result) {
                            resolve(result);
                        }
                    })
                } else {
                    reject(ERRORS.DATABASE.COLLECTION_UNDEFINED);
                }
            }
        )
    }

}


