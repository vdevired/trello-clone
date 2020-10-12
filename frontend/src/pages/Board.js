import React from "react";
import { v4 as uuidv4 } from "uuid";
import List from "../components/boards/List";

const Board = (props) => {
    const { id } = props.match.params;
    const board = {
        title: "Hello World",
        project: "The Boys",
        lists: [{ title: "List1", cards: [] }],
    }; // Get using route params

    return (
        <div className="board">
            <p className="board__title">{board.title}</p>
            <p className="board__subtitle">{board.project}</p>
            <div className="board__lists">
                {board.lists.map((list) => (
                    <List list={list} key={uuidv4()} />
                ))}
                <button className="btn board__create-list">
                    Add another list
                </button>
            </div>
        </div>
    );
};

export default Board;
