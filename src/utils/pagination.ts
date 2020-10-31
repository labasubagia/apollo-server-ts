export const getPaginationSkip = (args: {
  pageSize: number;
  pageNumber: number;
}): number => {
  return args.pageSize * (args.pageNumber > 1 ? args.pageNumber - 1 : 0);
};

export const getTotalPage = (args: {
  itemTotal: number;
  pageSize: number;
}): number => {
  return Math.ceil(args.itemTotal / args.pageSize);
};
