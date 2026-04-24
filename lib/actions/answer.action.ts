"use server";

import { IAnswerDoc } from "@/database/answer.model";
import {
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "@/types/action";
import {
  ActionResponse,
  Answer as TypeAnswer,
  ErrorResponse,
} from "@/types/global";
import { action } from "../handlers/action";
import {
  AnswerServerSchema,
  DeleteAnswerSchema,
  GetAnswersSchema,
} from "../validations";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { Answer, Question, Vote } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { after } from "next/server";
import { createInteraction } from "./interaction.action";

export async function createAnswer(
  params: CreateAnswerParams
): Promise<ActionResponse<IAnswerDoc>> {
  //Check validation
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  //Error of validation
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  //User id in the MONGO DB
  const userId = validationResult?.session?.user?.id;

  //Start session
  const session = await mongoose.startSession();
  //Start transaction
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question not found");

    const [newAnswer] = await Answer.create(
      [
        {
          author: userId,
          question: questionId,
          content,
        },
      ],
      { session }
    );

    if (!newAnswer) throw new Error("Failed to create answer");

    question.answers += 1;
    await question.save({ session });

    after(async () => {
      await createInteraction({
        action: "post",
        actionId: question._id.toString(),
        actionTarget: "question",
        authorId: userId as string,
      });
    });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newAnswer)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getAnswers(params: GetAnswersParams): Promise<
  ActionResponse<{
    answers: TypeAnswer[];
    isNext: boolean;
    totalAnswer: number;
  }>
> {
  //Validate
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  //The error case
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  //Extract each of items
  const {
    questionId,
    page = 1,
    pageSize = 10,
    filter,
  } = validationResult.params!;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  let sortCriteria = {};

  switch (filter) {
    case "latest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    //Find the count of answers that match the questionId
    const totalAnswer = await Answer.countDocuments({ question: questionId });
    //Find answers that match the questionId and its author has "_id name image"

    // {
    //   "_id": "a1",
    //   "content": "Nice post!",
    //   "author": "user123"
    // }
    //↓
    // {
    //   "_id": "a1",
    //   "content": "Nice post!",
    //   "author": {
    //     "_id": "user123",
    //     "name": "Kakeru",
    //     "image": "profile.jpg"
    //   }
    // }

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id name image")
      //sort data
      .sort(sortCriteria)
      //skip pages you set
      .skip(skip)
      //fetch data with limited count
      .limit(limit);

    const isNext = totalAnswer > skip + answers.length;
    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
        totalAnswer,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteAnswer(
  params: DeleteAnswerParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { answerId } = validationResult.params!;
  const { user } = validationResult.session!;

  try {
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error("Answer not found");

    if (answer.author.toString() === user?.id)
      throw new Error("You're not allowed to delete this answer");

    await Question.findByIdAndUpdate(
      answer.question,
      { $inc: { answers: -1 } },
      { new: true }
    );
    await Vote.deleteMany({ actionId: answerId, actionType: "answer" });

    await Answer.findByIdAndDelete(answerId);

    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
