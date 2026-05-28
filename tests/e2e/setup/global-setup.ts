import { cleanupE2EData, connectE2EDB, getE2EConnectionInfo, isE2EDBConnected } from "@/tests/config/db-e2e";
import { seed } from "../seeders/e2e.seeder";

const globalSetup = async () => {
  console.log("Starting E2E test global setup...");

  try {
    await connectE2EDB();

    const { dbName, host, port, isConnected } = getE2EConnectionInfo();
    console.log("E2E Database Connection Info:", {
      database: dbName,
      host,
      port,
      isConnected
    });

    if (!isE2EDBConnected()) {
      throw new Error("Failed to establish a stable E2E database connection");
    }

    await cleanupE2EData();

    const seedData = await seed();

    console.log("E2E global setup completed successfully", { dbName, host, port, isConnected });
    console.log(`Created ${Object.keys(seedData.users).length} test users`);
    console.log(`Created ${Object.keys(seedData.questions).length} test questions`);
  } catch (error) {
    console.error("E2E global setup failed", error);
    process.exit(1);
  }
};

export default globalSetup;
