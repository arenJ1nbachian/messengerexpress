import { createContext } from "react";

export const RequestContext = createContext({
  requests: null,
  setRequests: () => {},
  requestCount: 0,
  setRequestCount: () => {},
  selectedRequest: null,
  setSelectedRequest: () => {},
  selectedRequestRef: null,
});
