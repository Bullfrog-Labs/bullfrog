import { useLocation } from "react-router-dom";

// From https://reactrouter.com/web/example/query-parameters
export const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};
