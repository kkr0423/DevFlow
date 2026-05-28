import QuestionForm from "@/components/forms/QuestionForm";
import { createQuestion } from "@/lib/actions/question.action";
import { MockEditor, mockRouter, resetAllMocks } from "@/tests/mocks";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

// jest.mock("@/components/editor", () => MockEditor);
jest.mock("next/dynamic", () => {
  return function mockDynamic() {
    const Component = jest.fn((props) => {
      return <MockEditor {...props} />;
    });
    return Component;
  };
});
jest.mock("@/lib/actions/question.action", () => ({
  createQuestion: jest.fn()
}));

const mockCreateQuestion = createQuestion as jest.MockedFunction<typeof createQuestion>;

describe("QuestionForm Component", () => {
  beforeEach(() => {
    resetAllMocks();
    mockCreateQuestion.mockClear();
  });

  describe("Rendering", () => {
    it("should render all form fields", async () => {
      render(<QuestionForm />);

      expect(screen.getByLabelText(/Question Title/i)).toBeInTheDocument();
      expect(await screen.findByLabelText(/Detailed explanation of your problem/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Add tags/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Ask a question/i })).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("should show validation error when you click the button without filling forms", async () => {
      render(<QuestionForm />);

      const user = userEvent.setup();
      const askButton = screen.getByRole("button", { name: /Ask a question/i });

      await user.click(askButton);

      expect(screen.getByText("Title must be at least 5 characters.")).toBeInTheDocument();
      expect(screen.getByText("Minimum of 100 characters.")).toBeInTheDocument();
      expect(screen.getByText("Add at least one tag.")).toBeInTheDocument();
    });
  });

  describe("Submission", () => {
    it("should submit form successfully with valid data", async () => {
      render(<QuestionForm />);
      const user = userEvent.setup();
      mockCreateQuestion.mockResolvedValue({
        success: true,
        data: {
          _id: "123",
          title: "",
          content: "",
          description: "",
          tags: [],
          author: {
            _id: "",
            name: "",
            image: ""
          },
          createdAt: new Date(),
          upvotes: 0,
          downvotes: 0,
          answers: 0,
          views: 0
        }
      });

      await user.type(screen.getByLabelText(/question title/i), "Unit Testing Title");
      await user.click(screen.getByTestId("mdx-editor"));
      await user.type(
        screen.getByTestId("mdx-editor"),
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      );

      const tagInput = screen.getByPlaceholderText(/add tags/i);
      fireEvent.change(tagInput, { target: { value: "react" } });
      fireEvent.keyDown(tagInput, { key: "Enter" });

      const submitBtn = screen.getByRole("button", { name: /ask a question/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(createQuestion).toHaveBeenCalledWith({
          title: "Unit Testing Title",
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
          tags: ["react"]
        });

        expect(toast).toHaveBeenCalledWith("Success", {
          description: "Question created successfully"
        });

        expect(mockRouter.push).toHaveBeenCalledWith("/questions/123");
      });
    });

    it("should submit form failure", async () => {
      render(<QuestionForm />);
      const user = userEvent.setup();
      mockCreateQuestion.mockResolvedValue({ success: false, status: 400, error: { message: "Something went wrong" } });

      await user.type(screen.getByLabelText(/question title/i), "Unit Testing Title");
      await user.click(screen.getByTestId("mdx-editor"));
      await user.type(screen.getByTestId("mdx-editor"), "This is a testing explanation of my problem.".repeat(3));

      const tagInput = screen.getByPlaceholderText(/add tags/i);
      fireEvent.change(tagInput, { target: { value: "react" } });
      fireEvent.keyDown(tagInput, { key: "Enter" });

      const submitBtn = screen.getByRole("button", { name: /ask a question/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Error400", {
          description: "Something went wrong"
        });
      });
    });
  });
});
