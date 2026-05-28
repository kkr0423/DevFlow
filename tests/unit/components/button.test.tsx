import { Button } from "@/components/ui/button";
import { fireEvent, render, screen } from "@testing-library/react";

describe("Button Component - TTD Approach", () => {
  it("should render a button with text", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
  });

  it("should call the onClick function when the button is clicked", () => {
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Click me</Button>);

    const button = screen.getByText("Click me");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("should render the button with the correct variant", () => {
    render(<Button variant="destructive">Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toHaveClass("bg-destructive");
  });

  it("should render the button with the correct disabled state", () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByText("Click me");
    expect(button).toHaveAttribute("disabled");
  });
});
