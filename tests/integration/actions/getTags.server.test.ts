import { Tag } from "@/database";
import { getTags } from "@/lib/actions/tag.action";
import { PaginatedSearchParams } from "@/types/global";

describe("getTags", () => {
  describe("Validation", () => {
    it("should return error if invalid params", async () => {
      const invalidParams = { page: "invalid", pageSize: -5 } as unknown as PaginatedSearchParams;

      const result = await getTags(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error && result.error.message).toContain(
        "Invalid input: expected number, received string, Too small: expected number to be >0"
      );
    });
  });

  describe("Pagination and Sorting", () => {
    beforeEach(async () => {
      const testTags = [
        {
          name: "javascript",
          questions: 100,
          createdAt: "2026-01-01"
        },
        {
          name: "react",
          questions: 50,
          createdAt: "2026-02-01"
        },
        {
          name: "node",
          questions: 200,
          createdAt: "2026-03-01"
        }
      ];

      await Tag.insertMany(testTags);
    });

    afterEach(async () => {
      await Tag.deleteMany({});
    });

    it("should return the first page of tags sorted by question count (default behavior)", async () => {
      const { success, data } = await getTags({ page: 1, pageSize: 2 });

      expect(success).toBe(true);
      expect(data?.tags).toHaveLength(2);
      expect(data?.tags[0].name).toBe("javascript");
      expect(data?.tags[1].name).toBe("react");
      expect(data?.isNext).toBe(true);
    });

    it("should return the second page of when paginated", async () => {
      const { success, data } = await getTags({ page: 2, pageSize: 10 });

      expect(success).toBe(true);
      expect(data?.tags).toHaveLength(0);
      expect(data?.isNext).toBe(false);
    });
  });

  describe("Search Functionality", () => {
    beforeEach(async () => {
      const testTags = [
        {
          name: "javascript",
          questions: 100,
          createdAt: "2026-01-01"
        },
        {
          name: "react",
          questions: 50,
          createdAt: "2026-02-01"
        },
        {
          name: "node",
          questions: 200,
          createdAt: "2026-03-01"
        },
        {
          name: "java",
          questions: 150,
          createdAt: "2026-04-01"
        }
      ];

      await Tag.insertMany(testTags);
    });

    afterEach(async () => {
      await Tag.deleteMany({});
    });

    it("should filter tags by partial name match (case insensitive)", async () => {
      const { success, data } = await getTags({ page: 1, pageSize: 10, query: "jav" });

      expect(success).toBe(true);
      expect(data?.tags).toHaveLength(2);
      expect(data?.tags.map((tag) => tag.name)).toEqual(expect.arrayContaining(["javascript", "java"]));
    });

    it("should return an empty array when no tags match the query", async () => {
      const { success, data } = await getTags({ page: 1, pageSize: 10, query: "nonexistent" });

      expect(success).toBe(true);
      expect(data?.tags).toHaveLength(0);
    });
  });
});
