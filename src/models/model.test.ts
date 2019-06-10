import { defaultDataStore } from "./DataStore";
import { defaultMenuEntry } from "./MenuEntry";
import { defaultTimerEntry } from "./TimerEntry";

it("TimerEntry without crashing", () => {
  const entry = defaultTimerEntry;
  const title = entry.title;
});

it("MenuEntry without crashing", () => {
  const entry = defaultMenuEntry;
  const e = entry.name;
});

it("without crashing", () => {
  const dataStore = defaultDataStore;
  const i = dataStore.menuIndex;
  expect(i).toBe(0);
});
