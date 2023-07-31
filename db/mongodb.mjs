import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://muhammadhamdali572:hamdali99332@cluster0.g7j5dka.mongodb.net/userdatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to Atlas");
  } catch (err) {
    console.log(err.stack);
    process.exit(1);
  }
}

run().catch(console.dir);

export default client; // Export the MongoDB client
