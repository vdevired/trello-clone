import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCard from "./DraggableCard";
import { mergeRefs } from "../../static/js/util";
import { authAxios } from "../../static/js/util";
import { backendUrl } from "../../static/js/const";
import { updateList } from "../../static/js/board";

const getListStyle = (isDragging, defaultStyle) => {
    if (!isDragging) return defaultStyle;
    return {
        ...defaultStyle,
        transform: defaultStyle.transform + " rotate(5deg)",
    };
};

const getListTitleStyle = (isDragging, defaultStyle) => {
    if (!isDragging)
        return {
            ...defaultStyle,
            cursor: "pointer",
        };
    return {
        ...defaultStyle,
        cursor: "grabbing",
    };
};

const List = ({ list, index, board, setBoard }) => {
    const [addingCard, setAddingCard] = useState(false);
    const [cardTitle, setCardTitle] = useState("");

    const onAddCard = (e) => {
        e.preventDefault();
        if (cardTitle.trim() === "") return;
        setAddingCard(false);
    };

    const handleHideAddCard = useCallback((e) => {
        const addCardForm = document.querySelector(".list__add-card-form");
        if (!addCardForm) return;
        if (!addCardForm.contains(e.target)) setAddingCard(false);
    }, []);

    useEffect(() => {
        if (addingCard) {
            document.addEventListener("click", handleHideAddCard);
        } else {
            document.removeEventListener("click", handleHideAddCard);
        }
    }, [addingCard]);

    const listCards = useRef(null);
    useEffect(() => {
        if (addingCard)
            listCards.current.scrollTop = listCards.current.scrollHeight;
    }, [addingCard]);

    const [editingTitle, setEditingTitle] = useState(false);

    const handleStopEditListTile = useCallback((e) => {
        const editListTitle = document.querySelector(".list__title-edit");
        if (!editListTitle) return;
        if (!editListTitle.contains(e.target)) setEditingTitle(false);
    }, []);

    useEffect(() => {
        if (editingTitle) {
            document.addEventListener("click", handleStopEditListTile);
            const editListTitle = document.querySelector(".list__title-edit");
            editListTitle.focus();
            editListTitle.select();
        } else {
            document.removeEventListener("click", handleStopEditListTile);
        }
    }, [editingTitle]);

    return (
        <Draggable draggableId={"list" + list.id.toString()} index={index}>
            {(provided, snapshot) => {
                if (
                    typeof provided.draggableProps.onTransitionEnd ===
                    "function"
                ) {
                    const anim = window?.requestAnimationFrame(() =>
                        provided.draggableProps.onTransitionEnd({
                            propertyName: "transform",
                        })
                    );
                }
                return (
                    <div
                        className="list"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getListStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}
                    >
                        <div
                            className="list__title"
                            {...provided.dragHandleProps}
                            style={getListTitleStyle(
                                snapshot.isDragging,
                                provided.dragHandleProps.style
                            )}
                        >
                            {!editingTitle ? (
                                <p onClick={() => setEditingTitle(true)}>
                                    {list.title}
                                </p>
                            ) : (
                                <EditList
                                    list={list}
                                    setEditingTitle={setEditingTitle}
                                    board={board}
                                    setBoard={setBoard}
                                />
                            )}
                            <i className="far fa-ellipsis-h"></i>
                        </div>
                        <Droppable droppableId={list.id.toString()} type="item">
                            {(provided) => (
                                <div
                                    className="list__cards"
                                    ref={mergeRefs(
                                        provided.innerRef,
                                        listCards
                                    )}
                                    {...provided.droppableProps}
                                >
                                    {list.items.map((card, index) => (
                                        <DraggableCard
                                            card={card}
                                            list={list}
                                            key={uuidv4()}
                                            index={index}
                                        />
                                    ))}
                                    {provided.placeholder}
                                    {addingCard && (
                                        <AddCard
                                            onAddCard={onAddCard}
                                            cardTitle={cardTitle}
                                            setCardTitle={setCardTitle}
                                        />
                                    )}
                                </div>
                            )}
                        </Droppable>
                        {!addingCard ? (
                            <button
                                className="list__add-card"
                                onClick={() => setAddingCard(true)}
                            >
                                Add card
                            </button>
                        ) : cardTitle.trim() !== "" ? (
                            <button
                                className="list__add-card list__add-card--active btn"
                                onClick={onAddCard}
                            >
                                Add
                            </button>
                        ) : (
                            <button
                                className="list__add-card list__add-card--active btn btn--disabled"
                                disabled
                            >
                                Add
                            </button>
                        )}
                    </div>
                );
            }}
        </Draggable>
    );
};

export default List;

const AddCard = ({ onAddCard, cardTitle, setCardTitle }) => (
    <form className="list__add-card-form" onSubmit={onAddCard}>
        <input
            type="text"
            name="title"
            value={cardTitle}
            placeholder="Enter card title..."
            onChange={(e) => setCardTitle(e.target.value)}
        />
    </form>
);

const EditList = ({ list, setEditingTitle, board, setBoard }) => {
    const [listTitle, setListTitle] = useState(list.title);

    const onEditList = async (e) => {
        e.preventDefault();
        if (listTitle.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/lists/${list.id}/`,
            {
                title: listTitle,
            }
        );
        console.log(data);
        updateList(board, setBoard)(data);
        setEditingTitle(false);
    };

    return (
        <form onSubmit={onEditList}>
            <input
                className="list__title-edit"
                type="text"
                name="title"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
            ></input>
        </form>
    );
};
