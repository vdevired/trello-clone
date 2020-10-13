import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import List from "../components/boards/List";

const Board = (props) => {
    const { id } = props.match.params;
    const [addingList, setAddingList] = useState(false);
    const board = {
        title: "Hello World",
        project: "The Boys",
        lists: [{ title: "List1", cards: [] }],
    }; // Get using route params

    const handleHideCreateList = useCallback((e) => {
        const createListForm = document.querySelector(
            ".board__create-list-form"
        );
        if (!createListForm) return;
        if (!createListForm.contains(e.target)) setAddingList(false);
    }, []);

    useEffect(() => {
        if (addingList) {
            document.addEventListener("click", handleHideCreateList);
        } else {
            document.removeEventListener("click", handleHideCreateList);
        }
    }, [addingList]);

    return (
        <div className="board">
            <p className="board__title">{board.title}</p>
            <p className="board__subtitle">{board.project}</p>
            <div className="board__lists">
                {board.lists.map((list) => (
                    <List list={list} key={uuidv4()} />
                ))}
                {addingList ? (
                    <CreateList />
                ) : (
                    <button
                        className="btn board__create-list"
                        onClick={() => setAddingList(true)}
                    >
                        Add another list
                    </button>
                )}
            </div>
        </div>
    );
};

const CreateList = () => {
    const [title, setTitle] = useState("");
    return (
        <form className="board__create-list-form">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                name="title"
                placeholder="Enter list title"
            />
            <button type="submit" className="btn btn--small">
                Add List
            </button>
        </form>
    );
};

export default Board;
