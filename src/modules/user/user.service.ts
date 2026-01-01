import { userRepo } from "./user.repo.js";

export const userService = {
  async getUserByEmail(email: string) {
    const getUser = await userRepo.getUserByEmail(email);
    if (!getUser) {
      throw new Error("User not found");
    }
    return getUser;
  },
};
