import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

it("renders without crashing", () => {
    const pauseStub = jest
    // @ts-ignore
        .spyOn(window.HTMLMediaElement.prototype, "pause")
        .mockImplementation(() => {return ;
        });
    ReactDOM.render(<App/>, document.createElement("root"));
    pauseStub.mockRestore();
});
