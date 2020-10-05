import React from 'react';

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

const ProfilePic = ({user}) => (
	user.profile_pic ? 
		<div className="member member--image">
            <img src={null} />
        </div> :
		<div className={`member member--${getNameColor(user.full_name)}`}>
            {user.full_name.substring(0, 1)}
        </div>
)

export default ProfilePic;