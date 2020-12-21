import { useState, useEffect } from "react";

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
  description: string;
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
  getUserPosts(): PostRecord[] {
    return [
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        id: "foo",
        body: "[]",
        title: "foo",
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
      description:
        "I am a French naval officer, explorer, conservationist, filmmaker, innovator, scientist, photographer, author and researcher who studies, the sea and all forms of life in water. Beleieve it or not, I co-developed the Aqua-Lung, pioneered marine conservation and was a member of the Académie française.",
    };
  }
}

const posts0 = [
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    id: "post0",
    body:
      "Newsletters have def become a primary curation tool. Not clear to me why they are so different from blogs. People have argued the subscription changes everything.",
    title: "Curators are the new Creators",
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    id: "post1",
    body:
      "A growing movement of people are tooling with back-end code to create sites that are more collage-like and artsy, in the vein of Myspace and Tumblr.",
    title:
      "Digital gardens let you cultivate your own little bit of the internet",
  },
];

const user0 = {
  createdAt: new Date(),
  updatedAt: new Date(),
  uid: "foo",
  displayName: "Leigh Stewart",
  username: "foo",
  description:
    "I am a French naval officer, explorer, conservationist, filmmaker, innovator, scientist, photographer, author and researcher who studies, the sea and all forms of life in water. Beleieve it or not, I co-developed the Aqua-Lung, pioneered marine conservation and was a member of the Académie française.",
};

export function useVillageState() {
  const [posts, setPosts] = useState<PostRecord[]>(posts0);
  const [user, setUser] = useState<UserRecord>(user0);

  useEffect(() => {}, []);

  return {
    posts: posts,
    user: user,
    addPost: (post: PostRecord) => {},
  };
}
