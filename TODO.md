# TODO: Update Total Students Trend API to Handle Filters and Mock Data Fallback

## Steps to Complete:
- [x] Update `src/app/api/branch-admin/charts/student-trends/route.js` to parse the `filter` query parameter (default to 'monthly').
- [x] Implement logic to set periods, labels, and date ranges based on filter:
  - Weekly: 12 periods, labels 'W1' to 'W12', weekly date ranges.
  - Monthly: 6 periods, month names, monthly date ranges.
  - Yearly: 3 periods, year labels, yearly date ranges.
- [x] Fetch student counts for each period and return data or mock if no valid data.
- [x] Test the API to ensure it returns data or mock for different filters.
