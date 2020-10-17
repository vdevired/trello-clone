import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCard from "./DraggableCard";

const getListStyle = (isDragging, defaultStyle) => {
    if (!isDragging) return defaultStyle;
    return {
        ...defaultStyle,
        transform: defaultStyle.transform + " rotate(5deg)",
    };
};

const List = ({ list, index }) => {
    return (
        <Draggable draggableId={"list" + list.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    className="list"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={getListStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                    )}
                >
                    <div className="list__title" {...provided.dragHandleProps}>
                        <p>{list.title}</p>
                        <i className="far fa-ellipsis-h"></i>
                    </div>
                    <Droppable droppableId={list.id.toString()} type="item">
                        {(provided) => (
                            <div
                                className="list__cards"
                                ref={provided.innerRef}
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
                            </div>
                        )}
                    </Droppable>
                    <div className="list__add-card">Add card</div>
                </div>
            )}
        </Draggable>
    );
};

export default List;
