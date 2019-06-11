import { MenuItem, Select } from "@material-ui/core";
import * as React from "react";
import { IMenuEntry } from "../models/MenuEntry";

interface ISelectMenuProps {
  onMenuSelect: (ev: React.ChangeEvent<any>) => void;
  menuIndex: number;
  menuEntries: IMenuEntry[];
}

export const SelectMenu: React.FC<ISelectMenuProps> = (
  props: ISelectMenuProps
): JSX.Element => (
  <Select value={props.menuIndex} onChange={props.onMenuSelect}>
    {props.menuEntries
      .map((e: IMenuEntry) => e.name)
      .map((n, i) => (
        <MenuItem value={i} key={n}>
          {n}
        </MenuItem>
      ))}
  </Select>
);
