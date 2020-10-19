import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCard from "./DraggableCard";
import { mergeRefs } from "../../static/js/util";

const getListStyle = (isDragging, defaultStyle) => {
    if (!isDragging) return defaultStyle;
    return {
        ...defaultStyle,
        transform: defaultStyle.transform + " rotate(5deg)",
    };
};

const List = ({ list, index }) => {
    const [addingCard, setAddingCard] = useState(false);
    const [title, setTitle] = useState("");
    const listCards = useRef(null);

    const startAddingCard = () => {
        setAddingCard(true);
        listCards.current.scrollTop = listCards.current.scrollHeight;
    };

    const onAddCard = (e) => {
        e.preventDefault();
        if (title.trim() === "") return;
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

    useEffect(() => {
        if (addingCard)
            listCards.current.scrollTop = listCards.current.scrollHeight;
    }, [addingCard]);

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
                        >
                            <p>{list.title}</p>
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
                                        <form
                                            className="list__add-card-form"
                                            onSubmit={onAddCard}
                                        >
                                            <input
                                                type="text"
                                                name="title"
                                                placeholder="Enter card title..."
                                                onChange={(e) =>
                                                    setTitle(e.target.value)
                                                }
                                            />
                                        </form>
                                    )}
                                </div>
                            )}
                        </Droppable>
                        {!addingCard ? (
                            <button
                                className="list__add-card"
                                onClick={startAddingCard}
                            >
                                Add card
                            </button>
                        ) : title.trim() !== "" ? (
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
