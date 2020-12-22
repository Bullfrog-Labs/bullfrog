export const post0 = {
  createdAt: new Date(),
  updatedAt: new Date(),
  id: "post0",
  body:
    "Newsletters have def become a primary curation tool. Not clear to me why they are so different from blogs. People have argued the subscription changes everything.",
  title: "Curators are the new Creators",
};

export const post1 = {
  createdAt: new Date(),
  updatedAt: new Date(),
  id: "post1",
  body:
    "A growing movement of people are tooling with back-end code to create sites that are more collage-like and artsy, in the vein of Myspace and Tumblr.",
  title:
    "Digital gardens let you cultivate your own little bit of the internet",
};

export const posts0 = [post0, post1];
export const user0 = {
  createdAt: new Date(),
  updatedAt: new Date(),
  uid: "sdhklfdjwlksdfsdfds",
  displayName: "Leigh Stewart",
  username: "l4stewar",
  description:
    "I am a French naval officer, explorer, conservationist, filmmaker, innovator, scientist, photographer, author and researcher who studies, the sea and all forms of life in water. Beleieve it or not, I co-developed the Aqua-Lung, pioneered marine conservation and was a member of the Académie française.",
};

export const user1 = {
  createdAt: new Date(),
  updatedAt: new Date(),
  uid: "2342893472398283",
  displayName: "Nimalan Mahendran",
  username: "nim",
  description:
    "Not only did I, the great Chola king, extend the influence of my already vast empire to the banks of the River Ganges, but across the ocean to coastal Burma, the Andaman and Nicobar islands, Sri Lanka, and the Maldives. AND I led a great navy to defeat and plunder the kingdom of the Srivijaya (Sumatra, Java and Malaya), and extracted tribute from the Khmer kingdom of Cambodia.",
};

export const userPosts0 = [
  { post: post0, user: user0 },
  { post: post1, user: user1 },
];
