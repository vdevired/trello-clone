import React from "react";
import { v4 as uuidv4 } from "uuid";
import Card from "./Card";

const List = ({ list }) => {
    return (
        <div className="list">
            <div className="list__title">
                <p>{list.title}</p>
                <i className="far fa-ellipsis-h"></i>
            </div>
            <div className="list__cards">
                {list.cards.map((card) => (
                    <Card card={card} key={uuidv4()} />
                ))}
            </div>
            <div className="list__add-card">Add card</div>
        </div>
    );
};

export default List;
