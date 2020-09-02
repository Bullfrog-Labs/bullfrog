import * as React from "react";
import * as log from "loglevel";
import { Logging, DocumentNode } from "kmgmt-common";
import { NotePreview } from "./NotePreview";
import { render } from "@testing-library/react-native";

Logging.configure(log);
const logger = log.getLogger("NotePreview.test");

test("render single row", async () => {
  const data = [
    {
      body: [
        {
          children: [
            {
              text: "Example note text",
              type: "text",
            },
          ],
          type: "paragraph",
        },
      ],
      id: "example-1",
    },
  ];

  logger.debug("running test!");
  const view = (
    <NotePreview
      document={{ children: data[0].body, type: "document" } as DocumentNode}
    />
  );
  const { getByText, debug } = render(view);
  debug();
  getByText(/Example note text/);
});
