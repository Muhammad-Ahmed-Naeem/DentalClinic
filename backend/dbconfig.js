import { MongoClient } from "mongodb";

const url = "mongodb+srv://zohaib:Rni@1237ht4y@cluster0.3t4qoai.mongodb.net/?appName=Cluster0"
const dbName = "dentalclinic"
export const collectionName = "dentalclinic"
const client = new MongoClient(url);

export const connection = async () => {
    const connect = await client.connect();
    return connect.db(dbName);
}

