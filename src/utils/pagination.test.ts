import { getPaginationSkip, getTotalPage } from './pagination';

interface SkipTestData {
  pageSize: number;
  pageNumber: number;
  pageSkipResult: number;
}

interface TotalPageTestData {
  itemTotal: number;
  pageSize: number;
  totalPageResult: number;
}

describe('pagination utils', () => {
  describe('getPageSkip', () => {
    it('should get the correct skip number', () => {
      expect.hasAssertions();
      const tests: SkipTestData[] = [
        {
          pageSize: 5,
          pageNumber: 1,
          pageSkipResult: 0,
        },
        {
          pageSize: 3,
          pageNumber: 2,
          pageSkipResult: 3,
        },
        {
          pageSize: 4,
          pageNumber: 3,
          pageSkipResult: 8,
        },
        {
          pageSize: 3,
          pageNumber: -1,
          pageSkipResult: 0,
        },
        {
          pageSize: 0,
          pageNumber: 1,
          pageSkipResult: 0,
        },
      ];
      tests.forEach(({ pageSize, pageNumber, pageSkipResult }) => {
        expect(getPaginationSkip({ pageSize, pageNumber })).toStrictEqual(
          pageSkipResult
        );
      });
    });
  });

  describe('getTotalPage', () => {
    it('should get the correct total page', () => {
      expect.hasAssertions();
      const tests: TotalPageTestData[] = [
        {
          itemTotal: 20,
          pageSize: 3,
          totalPageResult: 7,
        },
        {
          itemTotal: 25,
          pageSize: 10,
          totalPageResult: 3,
        },
        {
          itemTotal: 10,
          pageSize: 3,
          totalPageResult: 4,
        },
        {
          itemTotal: 45,
          pageSize: 8,
          totalPageResult: 6,
        },
      ];
      tests.forEach(({ itemTotal, pageSize, totalPageResult }) => {
        expect(getTotalPage({ itemTotal, pageSize })).toStrictEqual(
          totalPageResult
        );
      });
    });
  });
});
