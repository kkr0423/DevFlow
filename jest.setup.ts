import "@testing-library/jest-dom";
import { mockCredentials, mockGitHub, mockGoogle, mockResponse, mockUserRouter, mockUseSession } from "./tests/mocks";
import mockMongoose from "./tests/mocks/mongoose.mock";

jest.mock("next/navigation", () => ({
  useRouter: mockUserRouter
}));

jest.mock("sonner", () => ({
  toast: jest.fn()
}));

jest.mock("next-auth", () => ({
  useSession: mockUseSession
}));

jest.mock("next-auth/react", () => ({
  useSession: mockUseSession
}));

jest.mock("next-auth", () => mockUseSession);

jest.mock("next-auth/providers/github", () => ({
  useProvider: mockGitHub
}));

jest.mock("next-auth/providers/google", () => ({
  useProvider: mockGoogle
}));

jest.mock("next/server", () => ({
  useResponse: mockResponse
}));

jest.mock("next-auth/providers/credentials", () => mockCredentials);

jest.mock("mongoose", () => mockMongoose);
