import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { DragDropContext } from "react-beautiful-dnd";

import List from "../components/boards/List";

const Board = (props) => {
    const { id } = props.match.params;
    const [addingList, setAddingList] = useState(false);
    const [board, setBoard] = useState({
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
                        labels: [],
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
                title: "List1",
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

    const onDragEnd = (result) => {
        // Must update state synchromously so hit endpoint after setState
        // A bit optimistic but a must
        const { source, destination, draggableId } = result;

        if (!destination) return; // Dropped outside of list
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        )
            return; // Position didn't change

        const sourceList = board.lists.find(
            (list) => list.id.toString() === source.droppableId
        );
        const item = sourceList.items.find(
            (item) => item.id.toString() === draggableId
        );
        const destinationList = board.lists.find(
            (list) => list.id.toString() === destination.droppableId
        );

        const newItems = [...sourceList.items];
        let newItems2;
        if (source.droppableId === destination.droppableId) {
            newItems2 = newItems;
        } else {
            newItems2 = [...destinationList.items];
        }
        newItems.splice(source.index, 1);
        newItems2.splice(destination.index, 0, item);

        const newList = {
            ...sourceList,
            items: newItems,
        };

        const newList2 = {
            ...destinationList,
            items: newItems2,
        };

        const newLists = board.lists.map((list) => {
            if (list.id === newList.id) return newList;
            else if (list.id === newList2.id) return newList2;
            return list;
        });

        const newBoard = {
            ...board,
            lists: newLists,
        };

        setBoard(newBoard);
    };

    return (
        <div className="board">
            <p className="board__title">{board.title}</p>
            <p className="board__subtitle">{board.project}</p>
            <DragDropContext onDragEnd={onDragEnd}>
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
            </DragDropContext>
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
