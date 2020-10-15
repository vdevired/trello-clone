import React from "react";
import { v4 as uuidv4 } from "uuid";
import { Droppable } from "react-beautiful-dnd";
import DraggableCard from "./DraggableCard";

const List = ({ list }) => {
    return (
        <div className="list">
            <div className="list__title">
                <p>{list.title}</p>
                <i className="far fa-ellipsis-h"></i>
            </div>
            <Droppable droppableId={list.id.toString()}>
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
    );
};

export default List;
