export interface DemoAccount {
  id: string;
  username: string;
  password: string;
  userId: string;
  displayName: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "1",
    username: import.meta.env.VITE_DEMO_USER1_ID || "demo_user_1",
    password: import.meta.env.VITE_DEMO_USER1_PW || "demo_pass_1",
    userId: "1",
    displayName: "Demo User 1",
  },
  {
    id: "2",
    username: import.meta.env.VITE_DEMO_USER2_ID || "demo_user_2",
    password: import.meta.env.VITE_DEMO_USER2_PW || "demo_pass_2",
    userId: "2",
    displayName: "Demo User 2",
  },
  {
    id: "3",
    username: import.meta.env.VITE_DEMO_USER3_ID || "demo_user_3",
    password: import.meta.env.VITE_DEMO_USER3_PW || "demo_pass_3",
    userId: "3",
    displayName: "Demo User 3",
  },
];

export const DEMO_LOGIN_ENABLED = true;
