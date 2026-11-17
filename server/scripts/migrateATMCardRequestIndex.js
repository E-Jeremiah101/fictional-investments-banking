import "dotenv/config";
import mongoose from "mongoose";

const migrateATMCardRequestIndex = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from the .env file");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const database = mongoose.connection.db;
    const collections = await database
      .listCollections({ name: "atmcardrequests" }, { nameOnly: true })
      .toArray();

    if (collections.length === 0) {
      console.log("ATM card request collection does not exist; no migration needed.");
      return;
    }

    const collection = database.collection("atmcardrequests");
    const indexes = await collection.indexes();
    const legacyIndex = indexes.find(
      (index) =>
        index.unique &&
        !index.partialFilterExpression &&
        index.key.withdrawalRequest === 1,
    );

    if (legacyIndex) {
      await collection.dropIndex(legacyIndex.name);
      console.log(
        "Removed the unique withdrawal link index. Standalone ATM applications are enabled.",
      );
    } else {
      console.log("No legacy unique withdrawal link index found.");
    }
  } finally {
    await mongoose.disconnect();
  }
};

migrateATMCardRequestIndex().catch((error) => {
  console.error("ATM card index migration failed:", error.message);
  process.exitCode = 1;
});
