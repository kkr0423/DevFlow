export interface TestUser {
  name: string;
  username: string;
  email: string;
  password: string;
}

export const BROWSER_USERS: Record<string, TestUser> = {
  chrome: {
    name: "Chrome Test User",
    username: "chromeuser",
    email: "e2e-chrome@test.com",
    password: "password123"
  },

  firefox: {
    name: "Firefox Test User",
    username: "firefoxuser",
    email: "e2e-firefox@test.com",
    password: "firefox123"
  },

  safari: {
    name: "Safari Test User",
    username: "safariuser",
    email: "e2e-safari@test.com",
    password: "safari123"
  },

  edge: {
    name: "Edge Test User",
    username: "edgeuser",
    email: "e2e-edge@test.com",
    password: "edge123"
  },

  mobileChrome: {
    name: "Mobile Chrome User",
    username: "mobilechrome",
    email: "mobile-chrome@test.com",
    password: "mobile123"
  },

  mobileSafari: {
    name: "Mobile Safari User",
    username: "mobilesafari",
    email: "mobile-safari@test.com",
    password: "mobile123"
  }
};

export const COMMON_USERS: TestUser[] = [
  {
    name: "Regular Test User",
    username: "testuser",
    email: "test@example.com",
    password: "password123"
  },
  {
    name: "Admin User",
    username: "adminuser",
    email: "admin@example.com",
    password: "admin123"
  },
  {
    name: "Guest User",
    username: "guestuser",
    email: "guest@example.com",
    password: "guest123"
  },
  {
    name: "Frontend Developer",
    username: "frontenddev",
    email: "frontend@example.com",
    password: "reactnextjs"
  },
  {
    name: "Backend Developer",
    username: "backenddev",
    email: "backend@example.com",
    password: "nodeexpress"
  },
  {
    name: "British User",
    username: "londoncoder",
    email: "london@example.co.uk",
    password: "britishaccent"
  },
  {
    name: "Japanese User",
    username: "tokyodev",
    email: "tokyo@example.jp",
    password: "nihongo123"
  },
  {
    name: "Demo User",
    username: "demouser",
    email: "demo@example.com",
    password: "demo1234"
  },
  {
    name: "Inactive User",
    username: "inactiveuser",
    email: "inactive@example.com",
    password: "inactive123"
  },
  {
    name: "Power User",
    username: "poweruser",
    email: "power@example.com",
    password: "supersecure"
  }
];
