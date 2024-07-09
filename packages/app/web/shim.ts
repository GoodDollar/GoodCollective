// fix uniswap sdk issue
(globalThis as any).Browser = {
  T: () => {},
};
