"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import { action } from "../handlers/action";
import { SignInSchema, SignUpSchema } from "../validations";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";
import Account from "@/database/account.model";
import { signIn } from "@/auth";
import { NotFoundError } from "../http-errors";
import { AuthCredentials } from "@/types/action";

export async function signUpWithCredentials(
  params: AuthCredentials
): Promise<ActionResponse> {
  //Check validation
  const validationResult = await action({ params, schema: SignUpSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  //destruct the validated params
  const { name, username, email, password } = validationResult.params!;

  //get session on db
  const session = await mongoose.startSession();
  //Start transaction
  session.startTransaction();

  try {
    //Check weather user exists or not with email for session.
    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      throw new Error("User already exists");
    }

    //Check weather user exists or not with username for session.
    const existingUsernamme = await User.findOne({ username }).session(session);

    if (existingUsernamme) {
      throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    //Create new user
    const [newUser] = await User.create([{ username, name, email }], {
      session,
    });

    //Create account
    await Account.create(
      [
        {
          userId: newUser._id,
          name,
          password: hashedPassword,
          provider: "credentials",
          providerAccountId: email,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    //SignIn as new user
    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    //Stop transaction accidentally
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return handleError(error) as ErrorResponse;
  } finally {
    //End session
    if (!session.hasEnded) {
      await session.endSession();
    }
  }
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
  //Check validation
  const validationResult = await action({ params, schema: SignInSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  //destruct the validated params
  const { email, password } = validationResult.params!;

  try {
    //Check weather user exists or not with email for session.
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw new NotFoundError("User");

    const existingAccount = await Account.findOne({
      provider: "credentials",
      providerAccountId: email,
    });

    if (!existingAccount) throw new NotFoundError("Account");

    const passwordMatch = await bcrypt.compare(
      password,
      existingAccount.password
    );

    if (!passwordMatch) throw new Error("Password does not match");

    //SignIn as new user
    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
