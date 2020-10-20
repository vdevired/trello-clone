import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import useDocumentTitle from "../hooks/useDocumentTitle";

import { addList, onDragEnd } from "../static/js/board";
import List from "../components/boards/List";
import { authAxios } from "../static/js/util";
import { backendUrl } from "../static/js/const";

const Board = (props) => {
    const { id } = props.match.params;
    const [addingList, setAddingList] = useState(false);
    const [board, setBoard] = useState({
        id: 1,
        title: "Hello World",
        project: "The Boys",
        lists: [
            {
                id: 1,
                title: "List1",
                items: [
                    {
                        id: 1,
                        title: "Hello",
                        description: "",
                        assigned_to: [],
                        labels: [{ color: "red" }],
                        attachments: [],
                        comments: [],
                    },
                    {
                        id: 2,
                        title: "Hello2",
                        description: "",
                        assigned_to: [],
                        labels: [],
                        attachments: [],
                        comments: [],
                    },
                    {
                        id: 3,
                        title: "Hello3",
                        description: "",
                        assigned_to: [],
                        labels: [],
                        attachments: [],
                        comments: [],
                    },
                    {
                        id: 4,
                        title: "Hello4",
                        description: "",
                        assigned_to: [],
                        labels: [],
                        attachments: [],
                        comments: [],
                    },
                ],
            },
            {
                id: 2,
                title: "List2",
                items: [
                    {
                        id: 5,
                        title: "Hello",
                        description: "",
                        assigned_to: [],
                        labels: [],
                        attachments: [],
                        comments: [],
                    },
                    {
                        id: 6,
                        title: "Hello2",
                        description: "",
                        assigned_to: [],
                        labels: [],
                        attachments: [],
                        comments: [],
                    },
                    {
                        id: 7,
                        title: "Hello3",
                        description: "",
                        assigned_to: [],
                        labels: [],
                        attachments: [],
                        comments: [],
                    },
                    {
                        id: 8,
                        title: "Hello4",
                        description: "",
                        assigned_to: [],
                        labels: [],
                        attachments: [],
                        comments: [],
                    },
                ],
            },
        ],
    }); // Get using route params

    useDocumentTitle(board ? `${board.title} | Trello` : "");

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
            <DragDropContext onDragEnd={onDragEnd(board, setBoard)}>
                <Droppable
                    droppableId={"board" + board.id.toString()}
                    direction="horizontal"
                    type="list"
                >
                    {(provided) => (
                        <div
                            className="board__lists"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {board.lists.map((list, index) => (
                                <List
                                    list={list}
                                    index={index}
                                    key={uuidv4()}
                                    board={board}
                                    setBoard={setBoard}
                                />
                            ))}
                            {provided.placeholder}
                            {addingList ? (
                                <CreateList
                                    board={board}
                                    setBoard={setBoard}
                                    setAddingList={setAddingList}
                                />
                            ) : (
                                <button
                                    className="btn board__create-list"
                                    onClick={() => setAddingList(true)}
                                >
                                    Add another list
                                </button>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

const CreateList = ({ board, setBoard, setAddingList }) => {
    const [title, setTitle] = useState("");

    const onAddList = async (e) => {
        e.preventDefault();
        const { data } = await authAxios.post(`${backendUrl}/boards/lists/`, {
            board: board.id,
            title,
        });
        addList(board, setBoard)(data);
        setAddingList(false);
    };

    return (
        <form className="board__create-list-form" onSubmit={onAddList}>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                name="title"
                placeholder="Enter list title"
            />
            {title.trim() !== "" ? (
                <button type="submit" className="btn btn--small">
                    Add List
                </button>
            ) : (
                <button
                    type="submit"
                    className="btn btn--small btn--disabled"
                    disabled
                >
                    Add List
                </button>
            )}
        </form>
    );
};

export default Board;
