import ROUTES from "@/constants/routes";
import { test as base, BrowserContext, expect, Page } from "@playwright/test";

type QuestionFixture = {
  createQuestion: { questionId: string; title: string; page: Page };
};

export const test = base.extend<QuestionFixture>({
  createQuestion: [
    async ({ browser }, use) => {
      /**Open an isolated secret browser to avoid conflicting between each of test.
       * browser: chrome
       * context: secret window
       */
      const context: BrowserContext = await browser.newContext();
      //Open a new tag
      const page = await context.newPage();

      const questionTitle = `E2E Test Question ${Date.now()}`;

      await page.goto(ROUTES.ASK_QUESTION);
      await expect(page).toHaveURL(ROUTES.ASK_QUESTION);

      await page.getByRole("textbox", { name: "Question Title *" }).click();
      await page.getByRole("textbox", { name: "Question Title *" }).fill(questionTitle);
      await page.getByRole("textbox", { name: "editable markdown" }).click();
      await page
        .getByRole("textbox", { name: "editable markdown" })
        .fill(
          "I'm learning React and Next.js and want to understand how to use hooks properly. What are the best practices?"
        );

      await page.getByRole("textbox", { name: "Add tags..." }).click();
      await page.getByRole("textbox", { name: "Add tags..." }).fill("playwright");
      await page.getByRole("textbox", { name: "Add tags..." }).press("Enter");

      await page.getByRole("button", { name: "Ask a question" }).click();

      await expect(page).toHaveURL(/\/question\/[a-f0-9]+$/);
      const url = page.url();
      const questionId = url.split("/").pop();

      if (!questionId) throw new Error("Failed to extract questionId for the URL");

      await expect(page.getByRole("heading", { name: questionTitle, exact: true })).toBeVisible();

      //Pass fixture's values to pages for tests
      await use({ questionId, title: questionTitle, page });

      //Close the browser
      await context.close();
    },
    //Define to create a new fixture every test to avoid conflicting between each of test
    { scope: "test" }
  ]
});
