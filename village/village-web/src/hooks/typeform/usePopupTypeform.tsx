//import * as typeformEmbed from "@typeform/embed";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PopupInstance } from "@typeform/embed";

export const usePopupTypeform = (link: string) => {
  const popupRef = useRef<PopupInstance | null>(null);

  useEffect(() => {
    const renderForm = async () => {
      // Weird syntax is a workaround for https://github.com/Typeform/embed/issues/161
      const typeformEmbed = await import("@typeform/embed");
      popupRef.current = typeformEmbed.makePopup(link, {
        mode: "popover",
        open: "scroll",
        openValue: 30,
        autoClose: 3,
        hideScrollbars: true,
        onSubmit: function () {
          console.log("Typeform successfully submitted");
        },
        onReady: function () {
          console.log("Typeform is ready");
        },
        onClose: function () {
          console.log("Typeform is closed");
        },
      });

      popupRef.current?.open();
      console.log("done loading");
    };
    renderForm();
  }, [link]);

  const openPopup = useCallback(() => {
    popupRef.current?.open();
  }, [popupRef]);

  return { openPopup };
};
