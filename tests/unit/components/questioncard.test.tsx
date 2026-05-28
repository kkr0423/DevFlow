import QuestionCard from "@/components/cards/QuestionCard";
import { getTimeStamp } from "@/lib/utils";
import { MockEditdeleteAction } from "@/tests/mocks";
import { Question } from "@/types/global";
import { render, screen } from "@testing-library/react";
import { ReactNode } from "react";

jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});
jest.mock("next/image", () => {
  return function MockLImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  };
});
jest.mock("@/components/user/EditdeleteAction", () => MockEditdeleteAction);

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}));

//Named import format
jest.mock("@/components/Metric", () => {
  return {
    __esModule: true,
    Metric: ({
      imgUrl,
      alt,
      value,
      title,
      textStyles
    }: {
      imgUrl: string;
      alt: string;
      value: number;
      title: string;
      textStyles?: string;
    }) => (
      <div className={textStyles}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgUrl} alt={alt} />
        {value} {title}
      </div>
    )
  };
});

const mockQuestion: Question = {
  _id: "123",
  title: "How to unit test a Next.js component?",
  content: "This is a sample question content",
  description: "",
  tags: [
    {
      _id: "tag1",
      name: "javascript"
    },
    {
      _id: "tag2",
      name: "next.js"
    }
  ],
  author: {
    _id: "user1",
    name: "John Doe",
    image: "/images/user.jpg"
  },
  createdAt: new Date("2035-09-01T12:00:00Z"),
  upvotes: 10,
  downvotes: 0,
  answers: 5,
  views: 100
};

const relativeTimeText = getTimeStamp(mockQuestion.createdAt);

describe("QuestionCard Component", () => {
  describe("Rendering", () => {
    it("should render all elements", () => {
      render(<QuestionCard question={mockQuestion} />);

      //Title
      expect(screen.getByText(mockQuestion.title)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: mockQuestion.title })).toHaveAttribute("href", "/questions/123");

      //Tags
      expect(screen.getByText("javascript")).toBeInTheDocument();
      expect(screen.getByText("next.js")).toBeInTheDocument();

      //Avatar
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();

      //Timestamp
      expect(screen.getByText(relativeTimeText)).toBeInTheDocument();

      //Metrics
      expect(screen.getByText("10 Votes")).toBeInTheDocument();
      expect(screen.getByText("5 Answers")).toBeInTheDocument();
      expect(screen.getByText("100 Views")).toBeInTheDocument();
    });
  });

  describe("Responsive behavior", () => {
    it("should hide timestamp on small screen", () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 500 });
      window.dispatchEvent(new Event("resize"));

      render(<QuestionCard question={mockQuestion} />);

      const timeStamp = screen.getByText(relativeTimeText, { selector: "span" });
      expect(timeStamp).toHaveClass("sm:hidden");
    });

    it("should appear timestamp on large screen", () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 800 });
      window.dispatchEvent(new Event("resize"));

      render(<QuestionCard question={mockQuestion} />);

      //Timestamp
      expect(screen.getByText(relativeTimeText)).toBeVisible();
      screen.debug();
    });
  });
});
