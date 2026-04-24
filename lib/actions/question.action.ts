"use server";

import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  Question as QuestionType,
} from "@/types/global";
import { action } from "../handlers/action";
import {
  AskQuestionSchema,
  DeleteQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamSchema,
} from "../validations";
import handleError from "../handlers/error";

import mongoose, { Types } from "mongoose";
import Tag, { ITagDoc } from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";
import Question, { IQuestionDoc } from "@/database/question.model";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionParams,
  IncrementViewsParams,
  RecommendationParams,
} from "@/types/action";
import dbConnect from "../mongoose";
import { Answer, Collection, Interaction, Vote } from "@/database";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createInteraction } from "./interaction.action";

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<QuestionType>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session }
    );

    if (!question) {
      throw new Error("Failed to create question");
    }

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocs = [];

    for (const tag of tags) {
      const existingTag = Tag.findOneAndUpdate(
        //Search existing tags by ignoring weather it is a capital or not
        {
          name: { $regex: new RegExp(`^${tag}$`, "i") },
        },
        //If tags exist, add count of questions by 1.
        // Otherwise create new tag and new count of questions form 1.
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        //upsert: Permit to update existing tags
        //new: Permit to create new tag
        { upsert: true, new: true, session }
      );

      //Fix : add await until resolve query operation
      const resolvedTag = await existingTag;
      tagIds.push(resolvedTag._id);
      tagQuestionDocs.push({
        tag: resolvedTag._id,
        question: question._id,
      });
    }

    await TagQuestion.insertMany(tagQuestionDocs, { session });

    await Question.findByIdAndUpdate(
      question._id,
      {
        $push: { tags: { $each: tagIds } },
      },
      { session }
    );

    after(async () => {
      await createInteraction({
        action: "post",
        actionId: question._id.toString(),
        actionTarget: "question",
        authorId: userId as string,
      });
    });

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
  }
}

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<QuestionType>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    if (question.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    const tagsToAdd = tags.filter(
      (tag) =>
        !question.tags.some((t: ITagDoc) =>
          t.name.toLowerCase().includes(tag.toLowerCase())
        )
    );

    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = Tag.findOneAndUpdate(
          //Search existing tags by ignoring weather it is a capital or not
          {
            name: { $regex: new RegExp(`^${tag}$`, "i") },
          },
          //If tags exist, add count of questions by 1.
          // Otherwise create new tag and new count of questions form 1.
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          //upsert: Permit to update existing tags
          //new: Permit to create new tag
          { upsert: true, new: true, session }
        );
        const resolvedTag = await existingTag;
        if (resolvedTag) {
          newTagDocuments.push({
            tag: resolvedTag._id,
            question: questionId,
          });

          question.tags.push(resolvedTag._id);
        }

        if (tagsToRemove.length > 0) {
          const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

          await Tag.updateMany(
            { _id: { $in: tagIdsToRemove } },
            { $inc: { questions: -1 } },
            { session }
          );

          await TagQuestion.deleteMany({
            tag: { $in: tagIdsToRemove },
            question: questionId,
          });

          question.tags = question.tags.filter(
            (tag: mongoose.Types.ObjectId) =>
              !tagsToRemove.some((id: mongoose.Types.ObjectId) =>
                id.equals(tag._id)
              )
          );
        }
      }
    }

    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }

    await question.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getQuestion(
  params: GetQuestionParams
): Promise<ActionResponse<QuestionType>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId)
      .populate("tags")
      .populate("author", "_id name image");

    if (!question) {
      throw new Error("Question not found");
    }

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: QuestionType[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: mongoose.QueryFilter<IQuestionDoc> = {};

  if (filter === "recommended")
    return {
      success: true,
      data: { questions: [], isNext: false },
    };

  if (query) {
    filterQuery.$or = [
      {
        title: { $regex: new RegExp(query, "i") },
      },
      {
        content: { $regex: new RegExp(query, "i") },
      },
    ];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "unanswered":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: { questions: JSON.parse(JSON.stringify(questions)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function incrementViews(
  params: IncrementViewsParams
): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    question.views += 1;

    await question.save();

    return {
      success: true,
      data: { views: question.viewss },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<
  ActionResponse<QuestionType[]>
> {
  try {
    await dbConnect();

    const questions = await Question.find()
      .sort({
        views: -1,
        upvotes: -1,
      })
      .limit(5);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(questions)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteQuestion(
  params: DeleteQuestionParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const { user } = validationResult.session!;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const question = await Question.findById(questionId).session(session);
    if (!question) throw new Error("Question not found");

    if (question.author.toString() !== user?.id) {
      throw new Error("You are not authorized to delete this question.");
    }

    await Collection.deleteMany({ question: questionId }).session(session);
    await TagQuestion.deleteMany({ question: questionId }).session(session);

    if (question.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questions: -1 } },
        { session }
      );
    }

    await Vote.deleteMany({
      actionId: questionId,
      actionType: "question",
    }).session(session);

    const answers = await Answer.find({ question: questionId }).session(
      session
    );

    if (answers.length > 0) {
      await Answer.deleteMany({ question: questionId }).session(session);

      await Vote.deleteMany({
        actionId: { $in: answers.map((answer) => answer.id) },
        actionType: "answer",
      }).session(session);
    }

    await Question.findByIdAndDelete(questionId).session(session);

    await session.commitTransaction();
    session.endSession();

    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getRecommendedQuestions({
  userId,
  query,
  skip,
  limit,
}: RecommendationParams) {
  const interactions = await Interaction.find({
    user: new Types.ObjectId(userId),
    actionType: "question",
    actions: { $in: ["view", "upvote", "bookmark", "post"] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const interactedQuestionIds = interactions.map((i) => i.actionId);

  const interactedQuestions = await Question.find({
    _id: { $in: interactedQuestionIds },
  }).select("tags");

  const allTags = interactedQuestions.flatMap((q) =>
    q.tags.map((tag: Types.ObjectId) => tag.toString())
  );

  const uniqueTagIds = [...new Set(allTags)];

  const recommendedQuery: mongoose.QueryFilter<typeof Question> = {
    _id: { $nin: interactedQuestionIds },
    author: { $ne: new Types.ObjectId(userId) },
    tags: { $in: uniqueTagIds.map((id) => new Types.ObjectId(id)) },
  };

  if (query) {
    recommendedQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ];
  }

  const total = await Question.countDocuments(recommendedQuery);

  const questions = await Question.find(recommendedQuery)
    .populate("tags", "name")
    .populate('author, "name image')
    .sort({ upvoted: -1, views: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    questions: JSON.parse(JSON.stringify(questions)),
    isNext: total > skip + questions.length,
  };
}
