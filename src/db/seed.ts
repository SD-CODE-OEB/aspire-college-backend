import { db } from "./index"; // Your database connection
import seedData from "./seed.json";
import { CollegeTable, CourseTable } from "./schema";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (optional - for development)
    await db.delete(CourseTable);
    await db.delete(CollegeTable);

    for (const item of seedData) {
      // Insert college
      const [college] = await db
        .insert(CollegeTable)
        .values({
          collegeName: item.name,
          location: item.location,
        })
        .returning()
        .then((res) => res);

      // Insert course for this college
      await db.insert(CourseTable).values({
        courseName: item.course,
        collegeId: college.collegeId,
        fee: item.fee.toString(), // Convert to string for decimal
      });

      console.log(`✅ Seeded: ${item.name} - ${item.course}`);
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
