import { PopupInstance } from "@typeform/embed";
import { useCallback, useEffect, useRef } from "react";

export type PopupTypeformConfig = {
  link: string;
  onReady: () => void;
  onSubmit: () => void;
  onClose: () => void;
};

export const usePopupTypeform = ({
  link,
  onReady,
  onSubmit,
  onClose,
}: PopupTypeformConfig) => {
  const popupRef = useRef<PopupInstance | null>(null);

  useEffect(() => {
    const renderForm = async () => {
      // Weird syntax is a workaround for https://github.com/Typeform/embed/issues/161
      const typeformEmbed = await import("@typeform/embed");
      popupRef.current = typeformEmbed.makePopup(link, {
        mode: "drawer_right",
        open: "scroll",
        openValue: 30,
        autoClose: 3,
        hideScrollbars: true,
        onSubmit: onSubmit,
        onReady: onReady,
        onClose: onClose,
      });
    };
    renderForm();
  }, [link, onClose, onReady, onSubmit]);

  const openPopup = useCallback(() => {
    popupRef.current?.open();
  }, [popupRef]);

  return { openPopup };
};
