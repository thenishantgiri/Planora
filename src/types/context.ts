import { Models, Databases, Storage } from "node-appwrite";

// User type matching Appwrite user structure
export interface AppUser extends Models.User<Models.Preferences> {
  $id: string;
  // Add any other properties from your Appwrite user that you need
}

// Context variables interface
export interface AppwriteContext {
  user: AppUser;
  databases: Databases;
  storage?: Storage;
}

// Create a type for Hono app variables
export type AppVariables = {
  user: AppUser;
  databases: Databases;
  storage?: Storage;
};
