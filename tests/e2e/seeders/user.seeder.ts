import { Account, User } from "@/database";
import { TestUser } from "../fixtures/users";
import bcrypt from "bcryptjs";

export async function createTestUser({ name, username, email, password }: TestUser) {
  const user = await User.create({
    name,
    username,
    email
  });
  await Account.create({
    userId: user._id,
    name,
    provider: "credentials",
    providerAccountId: email,
    password: await bcrypt.hash(password || "password123", 12)
  });

  console.log(`Created test user: ${username}}`);

  return user;
}
