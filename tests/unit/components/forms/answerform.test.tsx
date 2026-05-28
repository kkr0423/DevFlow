import AnswerForm from "@/components/forms/AnswerForm";
import { createAnswer } from "@/lib/actions/answer.action";
import { api } from "@/lib/api";
import { MockEditor, mockSession, mockUseSession, resetAllMocks } from "@/tests/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

const user = userEvent.setup();

// jest.mock("@/components/editor", () => MockEditor);
jest.mock("next/dynamic", () => {
  return function mockDynamic() {
    const Component = jest.fn((props) => {
      return <MockEditor {...props} />;
    });
    return Component;
  };
});

jest.mock("@/lib/actions/answer.action", () => ({
  createAnswer: jest.fn()
}));
jest.mock("@/lib/api", () => ({
  api: { ai: { getAnswer: jest.fn() } }
}));

const mockCreateAnswer = createAnswer as jest.MockedFunction<typeof createAnswer>;

const mockApiAiAnswer = api.ai.getAnswer as jest.MockedFunction<typeof api.ai.getAnswer>;

describe("AnswerForm Component", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("AI Generation", () => {
    it("should generate an AI answer for an authenticated user", async () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: jest.fn()
      });

      mockApiAiAnswer.mockResolvedValue({
        success: true,
        data: "This is an AI-generated answer"
      });

      render(<AnswerForm questionId="123" questionTitle="Test Question" questionContent="Test Content" />);

      await user.click(screen.getByRole("button", { name: /generate ai answer/i }));

      expect(mockApiAiAnswer).toHaveBeenCalledWith("Test Question", "Test Content", "");

      expect(toast).toHaveBeenCalledWith("Success", {
        description: "AI generated answer has been generated"
      });
    });

    it("should not generate an AI answer for an unauthenticated user", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn()
      });

      render(<AnswerForm questionId="123" questionTitle="Test Question" questionContent="Test Content" />);

      await user.click(screen.getByRole("button", { name: /generate ai answer/i }));

      expect(toast).toHaveBeenCalledWith("Please log in", {
        description: "You need to be logged in to use this feature"
      });

      expect(mockApiAiAnswer).not.toHaveBeenCalled();
    });

    it("should submit form successfully with valid data", async () => {
      mockCreateAnswer.mockResolvedValue({ success: true });

      render(<AnswerForm questionId="123" questionTitle="Test Question" questionContent="Test Content" />);

      await user.type(await screen.findByTestId("mdx-editor"), "This is my answer to the question".repeat(5));

      await user.click(screen.getByRole("button", { name: /post answer/i }));

      expect(mockCreateAnswer).toHaveBeenCalledWith({
        content: "This is my answer to the question".repeat(5),
        questionId: "123"
      });

      expect(toast).toHaveBeenCalledWith("Success", {
        description: "Your answer has been posted successfully"
      });
    });

    it("should disable submit button when form is submitting", async () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: jest.fn()
      });

      mockCreateAnswer.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );
      mockApiAiAnswer.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<AnswerForm questionId="123" questionTitle="Test Question" questionContent="Test Content" />);

      await user.type(await screen.findByTestId("mdx-editor"), "This is my answer to the question".repeat(5));

      const generateButton = await screen.findByRole("button", { name: /generate ai answer/i });

      await user.click(generateButton);

      const submitButton = screen.getByRole("button", { name: /post answer/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/posting/i)).toBeInTheDocument();

        expect(generateButton).toBeDisabled();
        expect(screen.getByText(/generating/i)).toBeInTheDocument();
      });
    });
  });
});
