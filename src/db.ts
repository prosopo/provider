import {AnyError, Collection, Db, Document, MongoClient, InsertManyResult} from "mongodb";
import {Database} from './types'
import {ERRORS} from './errors'
import {Captcha} from "./types/captcha";


export class ProsopoDatabase implements Database {
    readonly url: string;
    collections: { contract?: Collection, captchas?: Collection }
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
        this.collections.contract = db.collection("contract");
    }

    async loadCaptchas(captchas: Captcha[]): Promise<AnyError | InsertManyResult<Document>> {
        return new Promise<AnyError | InsertManyResult>((resolve, reject) => {
                if (this.collections.captchas !== undefined) {
                    this.collections.captchas.insertMany(captchas, function (err, result) {
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


