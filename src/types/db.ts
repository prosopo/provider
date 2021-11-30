import { Collection} from "mongodb";
export interface Database {
    readonly url: string;
    collections: { contract?: Collection }
    dbname: string;

    connect(): Promise<void>;

}