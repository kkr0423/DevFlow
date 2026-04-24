import { Schema, models, model, Document } from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  password?: string;
  bio?: string;
  image?: string;
  location?: string;
  portfolio?: string;
  reputation?: number;

  provider?: "local" | "github";
  providerAccountId?: string;
}

export interface IUserDoc extends IUser, Document {}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },

    provider: { type: String, enum: ["local", "github"], default: "local" },
    providerAccountId: { type: String, index: true },

    bio: { type: String },
    image: { type: String },
    location: { type: String },
    portfolio: { type: String },
    reputation: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
