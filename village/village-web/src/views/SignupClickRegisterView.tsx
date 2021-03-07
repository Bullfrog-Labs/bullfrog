import { SIGNUP_TYPEFORM_URL } from "../services/Typeform";

type SignupClickRegisterViewProps = {};

export const SignupClickRegisterView: React.FunctionComponent<SignupClickRegisterViewProps> = (
  props = {}
) => {
  window.location.href = SIGNUP_TYPEFORM_URL;
  return <></>;
};
