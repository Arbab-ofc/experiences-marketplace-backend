import type { User } from "./index";

type ExperienceResource = {
  id: number;
  host_id: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
      resource?: ExperienceResource;
    }
  }
}

export {};
