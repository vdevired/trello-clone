import React, {useState, useEffect, useRef} from 'react';
import { v4 as uuidv4 } from 'uuid';

const Card = ({card}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isViewingModal, setIsViewingModal] = useState(false);

	const cardElem = useRef(null);

	const handleState = e => {
		if (!cardElem.current.contains(e.target)) setIsEditing(false);
		else if (e.target.className.includes("pen")) setIsEditing(true);
		else setIsViewingModal(true);
	}

	useEffect(() => {
		if (!cardElem.current) return;
		document.addEventListener("click", handleState);

		return () => {
			document.removeEventListener("click", handleState);
		}
	}, [cardElem])

	return (
		<div 
			className={`card${card.image ? ' card--image' : ''}${isEditing ? ' card--edit' : ''}`}
			ref={cardElem}
		>
			{card.image && 
				<div className="card__image">
		    		<img src={card.image} />
		    	</div>
			}
	    	<div>
	            {!isEditing &&
	            	<button className="card__pen"><i className="fal fa-pen"></i></button>
	            }
	            <Labels labels={card.labels} />
	            {isEditing ? 
	            	<input 
	            		className="card__title-edit" type="text" value={card.title} 
	            		ref={el => {if (el) {el.focus(); el.select();}}}/> :
	            	<p className="card__title">{card.title}</p>
	            }
	            {card.attachments?.length !== 0 &&
	            	<p className="card__subtitle">
		                <i className="fal fa-paperclip"></i> {card.attachments.length}
		            </p>
		        }
		        <Members members={card.assigned_to} />
		        {isEditing && <EditControls cardElem={cardElem} />}
	        </div>
	    </div>
	);
}

const Labels = ({labels}) => (
	<div className="labels">
		{labels.map(label => (
			<p className={`labels__label labels__label--${label.color}`} key={uuidv4()}>___</p>
		))}
    </div>
);

const hashName = str => {
	let res = 0;
	for (let i = 0; i < str.length; i++) {
		res += str.charCodeAt(i);
	}

	return res+1; // So my name maps to blue
}

const colors = ["red", "yellow", "blue"];

const getNameColor = name => {
	return colors[hashName(name) % colors.length];
}

const Members = ({members}) => (
	 <div className="card__members">
        <div className="member member--add">
            <i className="fal fa-plus"></i>
        </div>
        {members.map(member => (
        	<div className={`member member--${getNameColor(member.full_name)}`} key={uuidv4()}>
                {member.full_name.substring(0, 1)}
            </div>
        ))}
    </div>
)

const getEditControlsSidePosition = cardElem => { // pass in ref.current
	if (!cardElem) return null;
	return {
		top: cardElem.getBoundingClientRect().y+"px",
		left : cardElem.getBoundingClientRect().x + cardElem.getBoundingClientRect().width + 10 + "px"
	}
}

const EditControls = ({cardElem}) => (
	<div className="card__edit-controls">
		<a className="btn">Save</a>
		<ul className="card__edit-controls-side" style={getEditControlsSidePosition(cardElem.current)}>
			<li><i className="fal fa-tags"></i> Edit Labels</li>
			<li><i className="fal fa-user"></i> Change Members</li>
			<li><i className="fal fa-arrow-right"></i> Move</li>
			<li><i className="fal fa-clock"></i> Change Due Date</li>
		</ul>
	</div>
)

export default Card;