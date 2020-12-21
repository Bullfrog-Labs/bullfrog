/**
 * Database records, translated directly to json in firestore.
 */

export interface BaseRecord {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRecord extends BaseRecord {
  uid: string;
  displayName: string;
  username: string;
}

export interface PostRecord extends BaseRecord {
  id: string;
  body: string;
  title: string;
}

/**
 * Model classes not directly represented in the database.
 */

export interface UserPost {
  user: UserRecord;
  post: PostRecord;
}

export class VillageController {
  handleAddPost(): void {}
  getUserPosts(): UserPost[] {
    return [
      {
        user: {
          createdAt: new Date(),
          updatedAt: new Date(),
          uid: "foo",
          displayName: "foo",
          username: "foo",
        },
        post: {
          createdAt: new Date(),
          updatedAt: new Date(),
          id: "foo",
          body: "[]",
          title: "foo",
        },
      },
    ];
  }
  getStackPosts(): UserPost[] {
    return [];
  }
  getUser(): UserRecord {
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      uid: "foo",
      displayName: "foo",
      username: "foo",
    };
  }
}
