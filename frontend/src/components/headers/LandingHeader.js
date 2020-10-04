import React from 'react';
import logo from '../../static/img/logo.png';

const LandingHeader = () => {
	return (
		<header className="landing-header">
			<div className="landing-header__section">
				<img className="landing-header__logo" src={logo} />
			</div>

			<div className="landing-header__section">
				<ul className="landing-header__list">
					<li className="landing-header__li">
						<a>
							Tour
						</a>
					</li>
					<li className="landing-header__li">
						<a>
							Pricing
						</a>
					</li>
					<li className="landing-header__li">
						<a>
							Learn
						</a>
					</li>
				</ul>
			</div>

			<div className="landing-header__section">
				<ul className="landing-header__list">
					<li className="landing-header__li">
						<a>
							Login
						</a>
					</li>
					<li className="landing-header__li">
						<a className="btn">
							Sign Up
						</a>
					</li>
				</ul>
			</div>
		</header>
	);
}

export default LandingHeader;
