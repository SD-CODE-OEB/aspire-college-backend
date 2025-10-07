import "dotenv/config";
import { db } from "./index"; // Your database connection
import seedData from "./seed.json";
import { CollegeTable, CourseTable, ReviewsTable } from "./schema";
import { eq } from "drizzle-orm";

/**
 * Validates database connection before seeding
 */
async function validateDatabaseConnection(): Promise<boolean> {
  try {
    // Simple query to check if database is accessible
    await db.select().from(CollegeTable).limit(1);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

/**
 * Checks if the database already has seeded data
 */
async function isDatabaseSeeded(): Promise<boolean> {
  try {
    const colleges = await db.select().from(CollegeTable).limit(1);
    return colleges.length > 0;
  } catch (error) {
    console.error("❌ Error checking database state:", error);
    return false;
  }
}

/**
 * Seeds the database with initial data
 * Handles production environments safely with validation and idempotency
 */
export async function seedDatabase(options: { force?: boolean } = {}) {
  const environment = process.env.NODE_ENV || "development";
  const isProduction = environment === "production";

  console.log("🌱 Starting database seeding...");
  console.log(`📍 Environment: ${environment}`);
  console.log(
    `🗄️  Database: ${
      process.env.DATABASE_URL ? "Connected to Neon" : "No DATABASE_URL found"
    }`
  );

  // Validate environment variables
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set!");
    throw new Error("DATABASE_URL is required for database seeding");
  }

  // Validate database connection
  console.log("🔍 Validating database connection...");
  const isConnected = await validateDatabaseConnection();
  if (!isConnected) {
    throw new Error(
      "Failed to connect to database. Please check your DATABASE_URL and network connection."
    );
  }
  console.log("✅ Database connection validated");

  // Check if database is already seeded
  const alreadySeeded = await isDatabaseSeeded();
  if (alreadySeeded && !options.force) {
    console.log("ℹ️  Database already contains data.");

    if (isProduction) {
      console.log(
        "⚠️  Seeding in production with existing data is not recommended."
      );
      console.log(
        "💡 Use '--force' flag if you want to clear and reseed the database."
      );
      console.log("⚠️  WARNING: This will delete all existing data!");
      return;
    } else {
      console.log("💡 Use '--force' flag to clear and reseed the database.");
      console.log(
        "⚠️  Note: This will delete all existing data in development."
      );
      return;
    }
  }

  // Extra confirmation for production
  if (isProduction && options.force) {
    console.log("⚠️  ============================================");
    console.log("⚠️  WARNING: You are about to seed a PRODUCTION database!");
    console.log("⚠️  This will DELETE all existing data!");
    console.log("⚠️  ============================================");
    console.log("⚠️  Set ALLOW_PRODUCTION_SEED=true to proceed.");

    if (process.env.ALLOW_PRODUCTION_SEED !== "true") {
      console.log("❌ Production seeding cancelled for safety.");
      console.log(
        "💡 Set ALLOW_PRODUCTION_SEED=true environment variable to allow production seeding."
      );
      return;
    }
  }

  try {
    // Clear existing data if force flag is set
    if (options.force) {
      console.log("🗑️  Clearing existing data...");
      await db.delete(CourseTable);
      await db.delete(CollegeTable);
      await db.delete(ReviewsTable);
      console.log("✅ Existing data cleared");
    }

    console.log(`📦 Inserting ${seedData.length} colleges with courses...`);
    let successCount = 0;
    let errorCount = 0;

    for (const item of seedData) {
      try {
        // Check if college already exists (for idempotent seeding)
        const existingCollege = await db
          .select()
          .from(CollegeTable)
          .where(eq(CollegeTable.collegeName, item.name))
          .limit(1);

        let college;

        if (existingCollege.length > 0) {
          college = existingCollege[0];
          console.log(`ℹ️  College already exists: ${item.name}`);
        } else {
          // Insert college
          const [insertedCollege] = await db
            .insert(CollegeTable)
            .values({
              collegeName: item.name,
              location: item.location,
            })
            .returning();

          college = insertedCollege;
          console.log(`✅ Inserted college: ${item.name}`);
        }

        // Insert course for this college
        await db.insert(CourseTable).values({
          courseName: item.course,
          collegeId: college.collegeId,
          fee: item.fee.toString(), // Convert to string for decimal
        });

        console.log(
          `✅ Seeded: ${item.name} - ${item.course} (Fee: ₹${item.fee})`
        );
        successCount++;
      } catch (itemError) {
        console.error(`❌ Error seeding ${item.name}:`, itemError);
        errorCount++;

        // In production, fail fast on any error
        if (isProduction) {
          throw itemError;
        }
      }
    }

    console.log("\n🎉 Database seeding completed!");
    console.log(`✅ Successfully seeded: ${successCount} colleges`);
    if (errorCount > 0) {
      console.log(`❌ Failed to seed: ${errorCount} colleges`);
    }
  } catch (error) {
    console.error("\n❌ Error during database seeding:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  // Check for --force flag
  const forceFlag = process.argv.includes("--force");

  seedDatabase({ force: forceFlag })
    .then(() => {
      console.log("\n✨ Seeding process completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Seeding process failed:", error);
      process.exit(1);
    });
}
