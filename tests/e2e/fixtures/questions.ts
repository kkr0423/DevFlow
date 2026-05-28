export interface TestQuestion {
  title: string;
  content: string;
  tags: string[];
}

export const SAMPLE_QUESTIONS: TestQuestion[] = [
  {
    title: "How to use React hooks effectively?",
    content: "I'm learning React and want to understand how to use hooks properly. What are the best practices????",
    tags: ["react", "javascript", "hooks"]
  },

  {
    title: "What is the best way to structure a Next.js project?",
    content:
      "I'm building a large-scale application with Next.js App Router. How should I organize folders and components?",
    tags: ["nextjs", "react", "architecture"]
  },

  {
    title: "How does useEffect work in React?",
    content: "I get confused about dependency arrays and rerenders. Can someone explain useEffect in simple terms?",
    tags: ["react", "useeffect", "frontend"]
  },

  {
    title: "How to improve TypeScript skills?",
    content: "I know basic TypeScript, but I want to get better at generics, utility types, and advanced patterns.",
    tags: ["typescript", "javascript", "frontend"]
  },

  {
    title: "Best practices for API fetching in React?",
    content: "Should I use fetch, Axios, or React Query for data fetching in React applications?",
    tags: ["react", "api", "react-query"]
  },

  {
    title: "How to prepare for frontend interviews?",
    content: "I'm planning to apply for frontend developer jobs abroad. What topics should I focus on?",
    tags: ["frontend", "career", "interview"]
  },

  {
    title: "How to optimize React performance?",
    content: "My React application becomes slow when rendering large lists. What are common optimization techniques?",
    tags: ["react", "performance", "optimization"]
  },

  {
    title: "What is the difference between CSR and SSR?",
    content: "I'm confused about client-side rendering and server-side rendering in Next.js. When should I use each?",
    tags: ["nextjs", "ssr", "csr"]
  },

  {
    title: "How to learn English for software engineering?",
    content: "I want to improve my English speaking and listening skills to work as a frontend engineer in London.",
    tags: ["english", "career", "learning"]
  },

  {
    title: "How to implement authentication in Next.js?",
    content: "What is the recommended way to add authentication to a Next.js application using App Router?",
    tags: ["nextjs", "authentication", "security"]
  }
];
