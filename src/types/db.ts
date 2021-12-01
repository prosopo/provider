import {AnyError, Collection, Document, InsertManyResult} from "mongodb";
import {Captcha, Dataset} from "./captcha";
export interface Database {
    readonly url: string;
    collections: { contract?: Collection }
    dbname: string;

    connect(): Promise<void>;

    loadDataset(dataset: Dataset, hash: string): Promise<void>;

    getCaptcha(solved:boolean, datasetId: string): Promise<Captcha | undefined>;

    updateCaptcha(captcha: Captcha, datasetId: string): Promise<void>;

}