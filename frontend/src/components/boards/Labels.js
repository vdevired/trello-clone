import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const Labels = ({labels}) => (
	<div className="labels">
		{labels.map(label => (
			<p className={`labels__label labels__label--${label.color}`} key={uuidv4()}>___</p>
		))}
    </div>
);

export default Labels;