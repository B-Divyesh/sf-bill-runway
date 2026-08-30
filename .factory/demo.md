# Bill Runway demo

- URL: <https://bill-runway.sociobot.in/demo> (local: `http://127.0.0.1:4173/demo`)
- Entry point: choose **Try it with sample data** on the first screen.
- Sample: $900 available, monthly electricity and rent, a monthly caregiver
  deposit, and a one-time pharmacy bill. The rent creates a visible gap before
  the expected deposit.
- Storage: the demo uses IndexedDB database `demo:bill-runway` and localStorage
  keys prefixed `demo:bill-runway:`. Real data uses IndexedDB `bill-runway`.
- Reset: **Reset demo** replaces only the demo database with the original sample.
- Exit: **Start for real** deletes the demo database and opens the untouched real
  planner.
- Offline: visit the demo once online, then it can reload through the same
  service-worker shell while offline.
