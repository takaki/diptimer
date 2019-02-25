import { connect } from "react-redux";
import { Dispatch } from "redux";
import { execGo, execPause, ModelAction, setFinish, setMenuIndex, setRemainTime, updateModel } from "../actions";
import { GameTimer } from "../components/GameTimer";
import { DataStore } from "../models/DataStore";

export function mapStateToProps(state: DataStore) {
    return {dataStore: state};
}

export function mapDispatchToProps(dispatch: Dispatch<ModelAction>) {
    return {
        updateStore: (dataStore: DataStore) => dispatch(updateModel(dataStore)),
        setRemainTime: (s: string) => dispatch(setRemainTime(s)),
        execPause: () => dispatch(execPause()),
        execGo: () => dispatch(execGo()),
        setMenuIndex: (i: number) => dispatch(setMenuIndex(i)),
        setFinish: () => dispatch(setFinish()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GameTimer);
