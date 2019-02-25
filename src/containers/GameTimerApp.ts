import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ModelAction, updateModel } from "../actions";
import { GameTimer } from "../components/GameTimer";
import { DataStore } from "../models/DataStore";

export function mapStateToProps(state: DataStore) {
    return {dataStore: state};
}

export function mapDispatchToProps(dispatch: Dispatch<ModelAction>) {
    return {
        updateStore: (dataStore: DataStore) => dispatch(updateModel(dataStore)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GameTimer);
