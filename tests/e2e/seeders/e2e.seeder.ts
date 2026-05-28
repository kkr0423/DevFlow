import { SAMPLE_QUESTIONS } from "../fixtures/questions";
import { BROWSER_USERS, COMMON_USERS } from "../fixtures/users";
import { createTestQuestion } from "./question.seeder";
import { createTestUser } from "./user.seeder";

export async function seed() {
  try {
    const chromeUser = await createTestUser(BROWSER_USERS.chrome);

    const userPromises = COMMON_USERS.map(async (user) => await createTestUser(user));
    const allUsers = await Promise.all(userPromises);

    const questionPromises = SAMPLE_QUESTIONS.slice(0, 3).map(
      async (question) => await createTestQuestion({ ...question, author: chromeUser._id.toString() })
    );
    const allQuestions = await Promise.all(questionPromises);

    console.log("E2E database seeded with test data");

    return {
      users: { chromeUser, ...allUsers },
      questions: { ...allQuestions }
    };
  } catch (error) {
    console.error("Failed to seed E2E data:", error);
    throw error;
  }
}
