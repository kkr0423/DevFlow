import AuthForm from "@/components/forms/AuthForm";
import ROUTES from "@/constants/routes";
import { SignInSchema, SignUpSchema } from "@/lib/validations";
import { mockRouter, resetAllMocks } from "@/tests/mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

describe("AuthForm Component", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("Sign In Form", () => {
    describe("Rendering", () => {
      it("should display all required fields", () => {
        const onSubmit = jest.fn();
        render(
          <AuthForm
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
            formType="SIGN_IN"
          />
        );

        expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      });
    });

    describe("form validation", () => {
      it("should show validation error for invalid email", async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        render(
          <AuthForm
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
            formType="SIGN_IN"
          />
        );

        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Sign In" });

        await user.type(emailInput, "test@invalid");
        await user.type(passwordInput, "123123123");
        await user.click(submitButton);

        expect(screen.getByText("Please provide a valid email address.")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
      });

      it("should show validation error for invalid password", async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        render(
          <AuthForm
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
            formType="SIGN_IN"
          />
        );

        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Sign In" });

        await user.type(emailInput, "test@email.com");
        await user.type(passwordInput, "123");
        await user.click(submitButton);

        expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    describe("Submission", () => {
      it("should call onSubmit with valid data and proper loading state", async () => {
        const user = userEvent.setup();
        // const onSubmit = jest.fn().mockResolvedValue({ success: true });
        const onSubmit = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)));

        render(
          <AuthForm
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
            formType="SIGN_IN"
          />
        );

        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Sign In" });

        await user.type(emailInput, "test@valid.com");
        await user.type(passwordInput, "123123123");
        await user.click(submitButton);

        expect(screen.getByText("Signin In...")).toBeInTheDocument();
        expect(onSubmit).toHaveBeenCalledWith({
          email: "test@valid.com",
          password: "123123123"
        });
      });
    });

    describe("Success Handling", () => {
      it("should show success toast and redirect to home", async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn().mockResolvedValue({ success: true });

        render(
          <AuthForm
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
            formType="SIGN_IN"
          />
        );

        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Sign In" });

        await user.type(emailInput, "test@valid.com");
        await user.type(passwordInput, "123123123");
        await user.click(submitButton);

        expect(toast).toHaveBeenCalledWith("Success", { description: "Signed in successfully" });
        expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.HOME);
      });
    });

    describe("Failure Handling", () => {
      it("should show failure toast and redirect to home", async () => {
        const user = userEvent.setup();
        const onSubmit = jest
          .fn()
          .mockResolvedValue({ success: false, status: 401, error: { message: "Invalid credentials" } });

        render(
          <AuthForm
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
            formType="SIGN_IN"
          />
        );

        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Sign In" });

        await user.type(emailInput, "test@valid.com");
        await user.type(passwordInput, "123123123");
        await user.click(submitButton);

        expect(toast).toHaveBeenCalledWith("Error 401", { description: "Invalid credentials" });
      });
    });
  });

  describe("Sign Up Form", () => {
    describe("Rendering", () => {
      it("should display all required fields", () => {
        const onSubmit = jest.fn();

        render(
          <AuthForm
            schema={SignUpSchema}
            defaultValues={{ email: "", password: "", name: "", username: "" }}
            onSubmit={onSubmit}
            formType="SIGN_UP"
          />
        );
        expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByLabelText("Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Username")).toBeInTheDocument();
        expect(screen.getByText("Already have an account?")).toBeInTheDocument();
      });
    });

    describe("form validation", () => {
      it("should show validation error for invalid email", async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        render(
          <AuthForm
            schema={SignUpSchema}
            defaultValues={{ email: "", password: "", name: "", username: "" }}
            onSubmit={onSubmit}
            formType="SIGN_UP"
          />
        );

        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const nameInput = screen.getByLabelText("Name");
        const usernameInput = screen.getByLabelText("Username");
        const submitButton = screen.getByRole("button", { name: "Sign Up" });

        // invalid data
        await user.type(usernameInput, "@johndoe");
        await user.type(nameInput, "John Doe");
        await user.type(emailInput, "test@invalid");
        await user.type(passwordInput, "123");
        await user.click(submitButton);

        expect(screen.getByText("Username can only contain letters, numbers, and underscores.")).toBeInTheDocument();
        expect(screen.getByText("Please provide a valid email address.")).toBeInTheDocument();
        expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();

        // required fields
        await user.clear(usernameInput);
        await user.clear(nameInput);
        await user.clear(emailInput);
        await user.clear(passwordInput);

        expect(screen.getByText("Username must be at least 3 characters long.")).toBeInTheDocument();
        expect(screen.getByText("Name is required.")).toBeInTheDocument();
        expect(screen.getByText("Email is required.")).toBeInTheDocument();
        expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
      });
    });
  });
});
