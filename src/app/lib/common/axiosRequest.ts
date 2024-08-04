import { fetchReq, postReq, patchReq, deleteReq } from './requests';

// Network request interface
export const axiosRequest = {
  get: fetchReq,
  post: postReq,
  patch: patchReq,
  delete: deleteReq,
};
