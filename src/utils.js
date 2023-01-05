export const getTxId = (res) => {
  if (!res || !res.transaction) {
    return null;
  }

  return res.transaction.hash;
};
