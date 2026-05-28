const mockRouter = {
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  push: jest.fn(),
  prefetch: jest.fn()
};

const mockUserRouter = jest.fn(() => mockRouter);

export { mockUserRouter, mockRouter };
