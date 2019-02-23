import { DataStore } from "./DataStore";
import { MenuEntry } from "./MenuEntry";
import { TimerEntry } from "./TimerEntry";

it("TimerEntry without crashing", () => {
    const entry = new TimerEntry();
    const title = entry.title;
});

it("MenuEntry without crashing", () => {
    const entry = new MenuEntry();
    const e = entry.name;
});

it("without crashing", () => {
    const dataStore = new DataStore();
    const i = dataStore.menuIndex;
    expect(i).toBe(0);
});
