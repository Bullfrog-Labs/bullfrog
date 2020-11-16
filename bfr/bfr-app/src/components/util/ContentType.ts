export type ContentType =
  | "Long Read"
  | "Quick Read"
  | "Tweet"
  | "Mainstream Media"
  | "Blog or Newsletter"
  | "Other";

function isTweet(itemURL: string | undefined) {
  if (itemURL) {
    const url = new URL(itemURL);
    if (url.hostname.indexOf("twitter.com") > -1) {
      return true;
    }
  }
  return false;
}

function isBlogOrNewsletter(itemURL: string | undefined) {
  const blogOrNewsletterHostnames = [
    "substack.com",
    "blogger.com",
    "medium.com",
    "ribbonfarm.com",
  ];
  if (itemURL) {
    const url = new URL(itemURL);
    for (const hostname of blogOrNewsletterHostnames) {
      if (url.hostname.indexOf(hostname) > -1) {
        return true;
      }
    }
  }
  return false;
}

function isMSM(itemURL: string | undefined) {
  const msmHostnames = [
    "nytimes.com",
    "newyorker.com",
    "politico.com",
    "washingtonpost.com",
    "theatlantic.com",
  ];
  if (itemURL) {
    const url = new URL(itemURL);
    for (const hostname of msmHostnames) {
      if (url.hostname.indexOf(hostname) > -1) {
        return true;
      }
    }
  }
  return false;
}

function isLongRead(text: string) {
  if (text && text.split(/\s+/).length >= 3000) {
    return true;
  }
  return false;
}

function isQuickRead(text: string) {
  if (text && text.split(/\s+/).length < 300) {
    return true;
  }
  return false;
}

export function getContentType(
  data: firebase.firestore.DocumentData
): ContentType {
  if (isTweet(data.url)) {
    return "Tweet";
  } else if (isLongRead(data.text)) {
    return "Long Read";
  } else if (isQuickRead(data.text)) {
    return "Quick Read";
  } else if (isBlogOrNewsletter(data.url)) {
    return "Blog or Newsletter";
  } else if (isMSM(data.url)) {
    return "Mainstream Media";
  } else {
    return "Other";
  }
}
